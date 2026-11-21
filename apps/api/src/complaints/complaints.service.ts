import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthorRole, Prisma, Role, Status } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateCommentDto, CreateComplaintDto, GeoQueryDto, QueryComplaintsDto, UpdateComplaintDto, UpdateStatusDto } from './dto/complaints.dto';

@Injectable()
export class ComplaintsService {
  constructor(private prisma: PrismaService) {}

  private async wardForPincode(pincode?: string) {
    if (!pincode) return null;
    const wp = await this.prisma.wardPincode.findUnique({ where: { pincode } });
    return wp?.wardId ?? null;
  }

  /** Ward IDs an admin manages; null for SUPER_ADMIN (all). */
  private async adminWardIds(userId: string, role: Role): Promise<string[] | null> {
    if (role === Role.SUPER_ADMIN) return null;
    const rows = await this.prisma.adminWard.findMany({ where: { adminId: userId } });
    return rows.map((r) => r.wardId);
  }

  async create(userId: string, dto: CreateComplaintDto) {
    const wardId = await this.wardForPincode(dto.pincode);
    const complaint = await this.prisma.complaint.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address,
        pincode: dto.pincode,
        wardId,
        images: dto.imageUrls?.length
          ? { create: dto.imageUrls.slice(0, 5).map((imageUrl, i) => ({ imageUrl, sortOrder: i })) }
          : undefined,
        statusHistory: { create: { changedById: userId, toStatus: Status.PENDING } },
      },
      include: { images: true },
    });
    return complaint;
  }

  async mine(userId: string, q: QueryComplaintsDto) {
    const where: Prisma.ComplaintWhereInput = {
      userId,
      ...(q.status && { status: q.status }),
      ...(q.category && { category: q.category }),
    };
    const [items, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where, include: { images: { orderBy: { sortOrder: 'asc' } }, ward: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (q.page! - 1) * q.pageSize!, take: q.pageSize!,
      }),
      this.prisma.complaint.count({ where }),
    ]);
    return { items, total, page: q.page, pageSize: q.pageSize };
  }

  async detail(id: string, user: { id: string; role: Role }) {
    const c = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        comments: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: 'asc' } },
        statusHistory: { orderBy: { changedAt: 'asc' }, include: { changedBy: { select: { id: true, name: true } } } },
        user: { select: { id: true, name: true } },
        ward: { select: { id: true, name: true } },
      },
    });
    if (!c) throw new NotFoundException('Complaint not found');
    if (user.role === Role.USER && c.userId !== user.id) throw new ForbiddenException();
    if (user.role === Role.ADMIN) {
      const wardIds = await this.adminWardIds(user.id, user.role);
      if (wardIds && c.wardId && !wardIds.includes(c.wardId)) {
        // Read-only view allowed for other wards
      }
    }
    return c;
  }

  async update(id: string, userId: string, dto: UpdateComplaintDto) {
    const c = await this.prisma.complaint.findUnique({ where: { id } });
    if (!c) throw new NotFoundException();
    if (c.userId !== userId) throw new ForbiddenException();
    if (c.status !== Status.PENDING) throw new BadRequestException('Only PENDING complaints can be edited');
    return this.prisma.complaint.update({ where: { id }, data: dto, include: { images: true } });
  }

  async remove(id: string, userId: string) {
    const c = await this.prisma.complaint.findUnique({ where: { id } });
    if (!c) throw new NotFoundException();
    if (c.userId !== userId) throw new ForbiddenException();
    if (c.status !== Status.PENDING) throw new BadRequestException('Only PENDING complaints can be deleted');
    await this.prisma.complaint.delete({ where: { id } });
    return { deleted: true };
  }

  async listAll(user: { id: string; role: Role }, q: QueryComplaintsDto) {
    const wardIds = await this.adminWardIds(user.id, user.role);
    const where: Prisma.ComplaintWhereInput = {
      ...(q.status && { status: q.status }),
      ...(q.category && { category: q.category }),
      ...(q.wardId && { wardId: q.wardId }),
      ...(q.pincode && { pincode: q.pincode }),
      ...(wardIds && { wardId: { in: wardIds } }),
      ...(q.search && { OR: [{ title: { contains: q.search, mode: 'insensitive' } }, { description: { contains: q.search, mode: 'insensitive' } }] }),
      ...((q.from || q.to) && { createdAt: { gte: q.from ? new Date(q.from) : undefined, lte: q.to ? new Date(q.to) : undefined } }),
    };
    const [items, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 }, user: { select: { id: true, name: true } }, ward: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (q.page! - 1) * q.pageSize!, take: q.pageSize!,
      }),
      this.prisma.complaint.count({ where }),
    ]);
    return { items, total, page: q.page, pageSize: q.pageSize };
  }

  async geo(user: { id: string; role: Role }, q: GeoQueryDto) {
    const wardIds = await this.adminWardIds(user.id, user.role);
    return this.prisma.complaint.findMany({
      where: {
        latitude: { gte: q.minLat, lte: q.maxLat },
        longitude: { gte: q.minLng, lte: q.maxLng },
        ...(q.status && { status: q.status }),
        ...(q.wardId && { wardId: q.wardId }),
        ...(wardIds && { wardId: { in: wardIds } }),
      },
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 }, ward: { select: { name: true } } },
      take: 2000,
    });
  }

  async updateStatus(id: string, admin: { id: string; role: Role }, dto: UpdateStatusDto) {
    const c = await this.prisma.complaint.findUnique({ where: { id } });
    if (!c) throw new NotFoundException();
    const wardIds = await this.adminWardIds(admin.id, admin.role);
    if (wardIds && (!c.wardId || !wardIds.includes(c.wardId)))
      throw new ForbiddenException('Complaint is outside your wards');
    const images = dto.resolutionImageUrls?.slice(0, 3).map((imageUrl, i) => ({ imageUrl, type: 'RESOLUTION' as const, sortOrder: i }));
    const [, updated] = await this.prisma.$transaction([
      this.prisma.statusHistory.create({
        data: { complaintId: id, changedById: admin.id, fromStatus: c.status, toStatus: dto.status, remarks: dto.remarks },
      }),
      this.prisma.complaint.update({
        where: { id },
        data: {
          status: dto.status,
          images: images?.length ? { create: images } : undefined,
        },
        include: { images: true },
      }),
    ]);
    return updated;
  }

  async reopen(id: string, userId: string) {
    const c = await this.prisma.complaint.findUnique({ where: { id } });
    if (!c) throw new NotFoundException();
    if (c.userId !== userId) throw new ForbiddenException();
    if (c.status !== Status.RESOLVED) throw new BadRequestException('Only RESOLVED complaints can be reopened');
    const [, updated] = await this.prisma.$transaction([
      this.prisma.statusHistory.create({
        data: { complaintId: id, changedById: userId, fromStatus: c.status, toStatus: Status.PENDING, remarks: 'Reopened by citizen' },
      }),
      this.prisma.complaint.update({ where: { id }, data: { status: Status.PENDING } }),
    ]);
    return updated;
  }

  async addComment(complaintId: string, user: { id: string; role: Role }, dto: CreateCommentDto) {
    const c = await this.prisma.complaint.findUnique({ where: { id: complaintId } });
    if (!c) throw new NotFoundException();
    if (user.role === Role.USER && c.userId !== user.id) throw new ForbiddenException();
    return this.prisma.comment.create({
      data: {
        complaintId,
        authorId: user.id,
        content: dto.content,
        authorRole: user.role === Role.USER ? AuthorRole.USER : AuthorRole.ADMIN,
      },
      include: { author: { select: { id: true, name: true } } },
    });
  }

  async listComments(complaintId: string, user: { id: string; role: Role }) {
    const c = await this.prisma.complaint.findUnique({ where: { id: complaintId } });
    if (!c) throw new NotFoundException();
    if (user.role === Role.USER && c.userId !== user.id) throw new ForbiddenException();
    return this.prisma.comment.findMany({
      where: { complaintId },
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }
}

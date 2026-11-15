import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateWardDto, UpdateWardDto } from '../complaints/dto/complaints.dto';

@Injectable()
export class WardsService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.ward.findMany({
      include: { pincodes: true, _count: { select: { complaints: true, admins: true } } },
      orderBy: { name: 'asc' },
    });
  }
  create(dto: CreateWardDto) {
    return this.prisma.ward.create({
      data: { name: dto.name, pincodes: { create: (dto.pincodes ?? []).map((pincode) => ({ pincode })) } },
      include: { pincodes: true },
    });
  }
  async update(id: string, dto: UpdateWardDto) {
    const ward = await this.prisma.ward.findUnique({ where: { id } });
    if (!ward) throw new NotFoundException();
    if (dto.pincodes) {
      await this.prisma.wardPincode.deleteMany({ where: { wardId: id } });
      await this.prisma.wardPincode.createMany({ data: dto.pincodes.map((pincode) => ({ wardId: id, pincode })) });
    }
    return this.prisma.ward.update({
      where: { id },
      data: { name: dto.name },
      include: { pincodes: true },
    });
  }
  async addPincodes(id: string, pincodes: string[]) {
    await this.prisma.wardPincode.createMany({
      data: pincodes.map((pincode) => ({ wardId: id, pincode })),
      skipDuplicates: true,
    });
    return this.prisma.ward.findUnique({ where: { id }, include: { pincodes: true } });
  }
}

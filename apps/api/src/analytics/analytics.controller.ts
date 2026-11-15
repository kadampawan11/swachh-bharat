import { Controller, Get, Header, Query, Request, UseGuards } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { PrismaService } from '../prisma.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('api/analytics')
export class AnalyticsController {
  constructor(private prisma: PrismaService) {}

  private async scopedWhere(user: { id: string; role: Role }, wardId?: string): Promise<Prisma.ComplaintWhereInput> {
    if (user.role === Role.ADMIN) {
      const rows = await this.prisma.adminWard.findMany({ where: { adminId: user.id } });
      return { wardId: { in: rows.map((r) => r.wardId) } };
    }
    return wardId ? { wardId } : {};
  }

  @Get('dashboard')
  async dashboard(@Request() req: any, @Query('wardId') wardId?: string) {
    const where = await this.scopedWhere(req.user, wardId);
    const [total, byStatus, resolved] = await Promise.all([
      this.prisma.complaint.count({ where }),
      this.prisma.complaint.groupBy({ by: ['status'], where, _count: true }),
      this.prisma.statusHistory.findMany({
        where: { toStatus: 'RESOLVED', complaint: where },
        select: { changedAt: true, complaint: { select: { createdAt: true } } },
      }),
    ]);
    const avgResolutionHours = resolved.length
      ? resolved.reduce((s, h) => s + (h.changedAt.getTime() - h.complaint.createdAt.getTime()) / 3600000, 0) / resolved.length
      : 0;
    const statusMap = Object.fromEntries(byStatus.map((s) => [s.status, s._count]));
    return {
      total,
      pending: statusMap['PENDING'] ?? 0,
      inProgress: statusMap['IN_PROGRESS'] ?? 0,
      resolved: statusMap['RESOLVED'] ?? 0,
      rejected: statusMap['REJECTED'] ?? 0,
      closed: statusMap['CLOSED'] ?? 0,
      avgResolutionHours: Math.round(avgResolutionHours * 10) / 10,
    };
  }

  @Get('by-category')
  async byCategory(@Request() req: any) {
    const where = await this.scopedWhere(req.user);
    const rows = await this.prisma.complaint.groupBy({ by: ['category'], where, _count: true });
    return rows.map((r) => ({ category: r.category, count: r._count }));
  }

  @Get('by-status')
  async byStatus(@Request() req: any) {
    const where = await this.scopedWhere(req.user);
    const rows = await this.prisma.complaint.groupBy({ by: ['status'], where, _count: true });
    return rows.map((r) => ({ status: r.status, count: r._count }));
  }

  @Get('by-ward')
  async byWard(@Request() req: any) {
    const where = await this.scopedWhere(req.user);
    const rows = await this.prisma.complaint.groupBy({ by: ['wardId'], where, _count: true });
    const wards = await this.prisma.ward.findMany({ where: { id: { in: rows.map((r) => r.wardId!).filter(Boolean) } } });
    const names = Object.fromEntries(wards.map((w) => [w.id, w.name]));
    return rows.map((r) => ({ wardId: r.wardId, ward: r.wardId ? names[r.wardId] : 'Unassigned', count: r._count }));
  }

  @Get('trend')
  async trend(@Request() req: any, @Query('days') days = '30') {
    const where = await this.scopedWhere(req.user);
    const since = new Date(Date.now() - parseInt(days) * 86400000);
    const rows = await this.prisma.complaint.findMany({
      where: { ...where, createdAt: { gte: since } },
      select: { createdAt: true }, orderBy: { createdAt: 'asc' },
    });
    const byDay: Record<string, number> = {};
    for (const r of rows) {
      const d = r.createdAt.toISOString().slice(0, 10);
      byDay[d] = (byDay[d] ?? 0) + 1;
    }
    return Object.entries(byDay).map(([date, count]) => ({ date, count }));
  }

  @Get('export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="complaints.csv"')
  async export(@Request() req: any) {
    const where = await this.scopedWhere(req.user);
    const rows = await this.prisma.complaint.findMany({
      where,
      include: { user: { select: { name: true } }, ward: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = 'id,title,category,status,pincode,ward,reporter,address,latitude,longitude,created_at';
    const lines = rows.map((c) =>
      [c.id, esc(c.title), c.category, c.status, c.pincode, esc(c.ward?.name), esc(c.user.name), esc(c.address), c.latitude, c.longitude, c.createdAt.toISOString()].join(','));
    return [header, ...lines].join('\n');
  }
}

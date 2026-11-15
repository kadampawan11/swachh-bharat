import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { IsArray, IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { PrismaService } from '../prisma.service';

class CreateAdminDto {
  @IsString() @MinLength(2) name: string;
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
  @IsOptional() @IsArray() @IsString({ each: true }) wardIds?: string[];
}
class AssignWardsDto {
  @IsArray() @IsString({ each: true }) wardIds: string[];
}
class AdminStatusDto {
  @IsBoolean() isActive: boolean;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('api/admins')
export class AdminsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.user.findMany({
      where: { role: { in: [Role.ADMIN, Role.SUPER_ADMIN] } },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true,
                adminWards: { include: { ward: { select: { id: true, name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async create(@Body() dto: CreateAdminDto) {
    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash: await bcrypt.hash(dto.password, 10),
        role: Role.ADMIN,
        adminWards: { create: (dto.wardIds ?? []).map((wardId) => ({ wardId })) },
      },
      select: { id: true, name: true, email: true, role: true, adminWards: true },
    });
  }

  @Patch(':id/wards')
  async assignWards(@Param('id') id: string, @Body() dto: AssignWardsDto) {
    await this.prisma.adminWard.deleteMany({ where: { adminId: id } });
    await this.prisma.adminWard.createMany({ data: dto.wardIds.map((wardId) => ({ adminId: id, wardId })) });
    return this.prisma.user.findUnique({ where: { id }, select: { id: true, adminWards: { include: { ward: true } } } });
  }

  @Patch(':id/status')
  setStatus(@Param('id') id: string, @Body() dto: AdminStatusDto) {
    return this.prisma.user.update({ where: { id }, data: { isActive: dto.isActive }, select: { id: true, isActive: true } });
  }
}

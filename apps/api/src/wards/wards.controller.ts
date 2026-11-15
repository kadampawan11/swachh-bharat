import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { WardsService } from './wards.service';
import { CreateWardDto, UpdateWardDto } from '../complaints/dto/complaints.dto';
import { IsArray, Matches } from 'class-validator';

class PincodesDto {
  @IsArray() @Matches(/^\d{6}$/, { each: true }) pincodes: string[];
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/wards')
export class WardsController {
  constructor(private svc: WardsService) {}

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get() list() { return this.svc.list(); }

  @Roles(Role.SUPER_ADMIN)
  @Post() create(@Body() dto: CreateWardDto) { return this.svc.create(dto); }

  @Roles(Role.SUPER_ADMIN)
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateWardDto) { return this.svc.update(id, dto); }

  @Roles(Role.SUPER_ADMIN)
  @Post(':id/pincodes') addPincodes(@Param('id') id: string, @Body() dto: PincodesDto) {
    return this.svc.addPincodes(id, dto.pincodes);
  }
}

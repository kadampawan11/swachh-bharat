import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { ComplaintsService } from './complaints.service';
import { CreateCommentDto, CreateComplaintDto, GeoQueryDto, QueryComplaintsDto, UpdateComplaintDto, UpdateStatusDto } from './dto/complaints.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/complaints')
export class ComplaintsController {
  constructor(private svc: ComplaintsService) {}

  @Post() create(@Request() req: any, @Body() dto: CreateComplaintDto) {
    return this.svc.create(req.user.id, dto);
  }
  @Get('mine') mine(@Request() req: any, @Query() q: QueryComplaintsDto) {
    return this.svc.mine(req.user.id, q);
  }
  @Get() list(@Request() req: any, @Query() q: QueryComplaintsDto) {
    return this.svc.listAll(req.user, q);
  }
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('geo') geo(@Request() req: any, @Query() q: GeoQueryDto) {
    return this.svc.geo(req.user, q);
  }
  @Get(':id') detail(@Request() req: any, @Param('id') id: string) {
    return this.svc.detail(id, req.user);
  }
  @Patch(':id') update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateComplaintDto) {
    return this.svc.update(id, req.user.id, dto);
  }
  @Delete(':id') remove(@Request() req: any, @Param('id') id: string) {
    return this.svc.remove(id, req.user.id);
  }
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id/status') updateStatus(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.svc.updateStatus(id, req.user, dto);
  }
  @Post(':id/reopen') reopen(@Request() req: any, @Param('id') id: string) {
    return this.svc.reopen(id, req.user.id);
  }
  @Post(':id/comments') addComment(@Request() req: any, @Param('id') id: string, @Body() dto: CreateCommentDto) {
    return this.svc.addComment(id, req.user, dto);
  }
  @Get(':id/comments') comments(@Param('id') id: string) {
    return this.svc.listComments(id);
  }
}

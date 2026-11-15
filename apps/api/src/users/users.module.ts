import { Module } from '@nestjs/common';
import { AdminsController } from './users.controller';
@Module({ controllers: [AdminsController] })
export class UsersModule {}

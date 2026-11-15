import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { Category, Status } from '@prisma/client';

export class CreateComplaintDto {
  @IsString() @MinLength(5) @MaxLength(150) title: string;
  @IsString() @MinLength(10) @MaxLength(1000) description: string;
  @IsEnum(Category) category: Category;
  @Type(() => Number) @IsNumber() @Min(-90) @Max(90) latitude: number;
  @Type(() => Number) @IsNumber() @Min(-180) @Max(180) longitude: number;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @Matches(/^\d{6}$/) pincode?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) imageUrls?: string[];
}
export class UpdateComplaintDto {
  @IsOptional() @IsString() @MinLength(5) @MaxLength(150) title?: string;
  @IsOptional() @IsString() @MinLength(10) @MaxLength(1000) description?: string;
  @IsOptional() @IsEnum(Category) category?: Category;
}
export class UpdateStatusDto {
  @IsEnum(Status) status: Status;
  @IsOptional() @IsString() @MaxLength(500) remarks?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) resolutionImageUrls?: string[];
}
export class QueryComplaintsDto {
  @IsOptional() @IsEnum(Status) status?: Status;
  @IsOptional() @IsEnum(Category) category?: Category;
  @IsOptional() @IsString() wardId?: string;
  @IsOptional() @Matches(/^\d{6}$/) pincode?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(100) pageSize?: number = 20;
  @IsOptional() @IsString() from?: string;
  @IsOptional() @IsString() to?: string;
}
export class GeoQueryDto {
  @Type(() => Number) @IsNumber() minLat: number;
  @Type(() => Number) @IsNumber() maxLat: number;
  @Type(() => Number) @IsNumber() minLng: number;
  @Type(() => Number) @IsNumber() maxLng: number;
  @IsOptional() @IsEnum(Status) status?: Status;
  @IsOptional() @IsString() wardId?: string;
}
export class CreateCommentDto {
  @IsString() @MinLength(1) @MaxLength(1000) content: string;
}
export class CreateWardDto {
  @IsString() @MinLength(2) name: string;
  @IsOptional() @IsArray() @Matches(/^\d{6}$/, { each: true }) pincodes?: string[];
}
export class UpdateWardDto {
  @IsOptional() @IsString() @MinLength(2) name?: string;
  @IsOptional() @IsArray() @Matches(/^\d{6}$/, { each: true }) pincodes?: string[];
}
export class CreateAdminDto {
  @IsString() @MinLength(2) name: string;
  @IsString() email: string;
  @IsString() @MinLength(6) password: string;
  @IsOptional() @IsArray() @IsString({ each: true }) wardIds?: string[];
}

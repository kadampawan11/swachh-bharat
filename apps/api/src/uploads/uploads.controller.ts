import { BadRequestException, Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UPLOAD_ROOT } from './upload-dir';

const MAX_FILES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/heic': '.heic',
  'image/heif': '.heif',
};

mkdirSync(UPLOAD_ROOT, { recursive: true });

@UseGuards(JwtAuthGuard)
@Controller('api/upload')
export class UploadsController {
  @Post('images')
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES, {
      storage: diskStorage({
        destination: UPLOAD_ROOT,
        filename: (_req, file, cb) => cb(null, `${randomUUID()}${EXTENSIONS[file.mimetype]}`),
      }),
      limits: { fileSize: MAX_FILE_BYTES, files: MAX_FILES },
      fileFilter: (_req, file, cb) =>
        EXTENSIONS[file.mimetype]
          ? cb(null, true)
          : cb(new BadRequestException(`Unsupported image type: ${file.mimetype}`), false),
    }),
  )
  images(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('No images uploaded');
    return { urls: files.map((f) => `/uploads/${f.filename}`) };
  }
}

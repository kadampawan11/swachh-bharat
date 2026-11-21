import './load-env';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { UPLOAD_ROOT } from './uploads/upload-dir';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useStaticAssets(UPLOAD_ROOT, { prefix: '/uploads/' });
  await app.listen(process.env.PORT ?? 3000);
  console.log(`API on http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();

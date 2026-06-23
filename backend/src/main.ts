import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const corsOriginsRaw = configService.get<string>('CORS_ORIGINS') ?? '';
  const corsOrigins = corsOriginsRaw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tug Backend API')
    .setDescription(
      'Wellness Package Management System — backend API for the admin portal and the mobile app.',
    )
    .setVersion('1.0')
    .addServer('http://localhost:4000', 'Local development')
    .addTag('health', 'Service health')
    .addTag('admin-packages', 'Admin CRUD for wellness packages')
    .addTag(
      'mobile-packages',
      'Mobile read-only endpoints for active packages',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT') ?? 4000;
  await app.listen(port);

  Logger.log(`Tug backend listening on http://localhost:${port}`, 'Bootstrap');
  Logger.log(
    `Swagger UI available at http://localhost:${port}/api/docs`,
    'Bootstrap',
  );
}

void bootstrap();

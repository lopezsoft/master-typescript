/**
 * ===============================================
 * BOOTSTRAP APPLICATION
 * Configuración principal de la aplicación NestJS
 * ===============================================
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { AppLoggerService } from './core/logger/logger.service';
import { createValidationPipe } from './common/pipes/validation.pipe';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Obtener servicios
  const configService = app.get(ConfigService);
  const logger = app.get(AppLoggerService);
  app.useLogger(logger);

  // Variables de entorno
  const port = configService.get<number>('PORT', 3000);
  const env = configService.get<string>('NODE_ENV', 'development');
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');

  // ===============================================
  // MIDDLEWARES DE SEGURIDAD
  // ===============================================
  app.use(helmet()); // Headers de seguridad
  app.use(compression()); // Compresión GZIP

  // ===============================================
  // CORS
  // ===============================================
  app.enableCors({
    origin: corsOrigin,
    credentials: configService.get<boolean>('CORS_CREDENTIALS', true),
  });

  // ===============================================
  // PREFIX GLOBAL
  // ===============================================
  app.setGlobalPrefix('api/v1');

  // ===============================================
  // VALIDACIÓN GLOBAL
  // ===============================================
  app.useGlobalPipes(createValidationPipe());

  // ===============================================
  // FILTROS GLOBALES
  // ===============================================
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  // ===============================================
  // INTERCEPTORS GLOBALES
  // ===============================================
  app.useGlobalInterceptors(
    new LoggingInterceptor(logger),
    new TransformInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // ===============================================
  // SWAGGER / OPENAPI
  // ===============================================
  if (configService.get<boolean>('SWAGGER_ENABLED', true)) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(configService.get<string>('SWAGGER_TITLE', 'API'))
      .setDescription(
        configService.get<string>('SWAGGER_DESCRIPTION', 'API Documentation'),
      )
      .setVersion(configService.get<string>('SWAGGER_VERSION', '2.0.0'))
      .addBearerAuth()
      .addTag('Autenticación', 'Endpoints de registro, login y gestión de usuarios')
      .addTag('Health', 'Endpoints de monitoreo y health checks')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    const swaggerPath = configService.get<string>('SWAGGER_PATH', 'api/docs');
    
    SwaggerModule.setup(swaggerPath, app, document, {
      customSiteTitle: 'Master TypeScript API Docs',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    logger.log(`📚 Swagger docs: http://localhost:${port}/${swaggerPath}`, 'Bootstrap');
  }

  // ===============================================
  // GRACEFUL SHUTDOWN
  // ===============================================
  app.enableShutdownHooks();

  // ===============================================
  // START SERVER
  // ===============================================
  await app.listen(port);

  logger.log(`🚀 Servidor corriendo en: http://localhost:${port}`, 'Bootstrap');
  logger.log(`🌍 Entorno: ${env}`, 'Bootstrap');
  logger.log(`📡 API Base URL: http://localhost:${port}/api/v1`, 'Bootstrap');
  logger.log(`✅ Aplicación iniciada correctamente`, 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error('❌ Error al iniciar la aplicación:', error);
  process.exit(1);
});


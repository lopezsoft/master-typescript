/**
 * ===============================================
 * CONFIGURACIÓN CENTRALIZADA
 * Módulo para manejar variables de entorno
 * ===============================================
 */

import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Schema de validación para variables de entorno
 * Garantiza que todas las variables requeridas estén presentes
 */
const validationSchema = Joi.object({
  // Aplicación
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  APP_NAME: Joi.string().default('Master TypeScript API'),
  APP_VERSION: Joi.string().default('2.0.0'),

  // Base de datos
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('1d'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

  // CORS
  CORS_ORIGIN: Joi.string().default('*'),
  CORS_CREDENTIALS: Joi.boolean().default(true),

  // Rate Limiting
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),
  LOG_FILE_PATH: Joi.string().default('./logs'),

  // Swagger
  SWAGGER_ENABLED: Joi.boolean().default(true),
  SWAGGER_PATH: Joi.string().default('api/docs'),
  SWAGGER_TITLE: Joi.string().default('API Documentation'),
  SWAGGER_DESCRIPTION: Joi.string().default('API Description'),
  SWAGGER_VERSION: Joi.string().default('1.0.0'),
});

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true, // Hace que ConfigService esté disponible globalmente
      envFilePath: ['.env.local', '.env'], // Múltiples archivos .env
      validationSchema, // Valida variables al iniciar
      validationOptions: {
        allowUnknown: true, // Permite variables no definidas en el schema
        abortEarly: false, // Muestra todos los errores de validación
      },
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}

/**
 * Helper function para obtener configuración tipada
 * Uso: const dbConfig = getConfig<DatabaseConfig>(configService, 'database');
 */
export function getConfig<T>(configService: ConfigService, key: string): T {
  return configService.get<T>(key) as T;
}

/**
 * Interfaces para configuración tipada
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
}

export interface JwtConfig {
  secret: string;
  expiration: string;
  refreshSecret: string;
  refreshExpiration: string;
}

export interface AppConfig {
  env: string;
  port: number;
  name: string;
  version: string;
}

export interface CorsConfig {
  origin: string;
  credentials: boolean;
}

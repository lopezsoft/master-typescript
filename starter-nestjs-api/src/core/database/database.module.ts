/**
 * ===============================================
 * MÓDULO DE BASE DE DATOS
 * Configuración de TypeORM con PostgreSQL
 * ===============================================
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
        logging: configService.get<boolean>('DB_LOGGING', false),
        
        // Configuración de pool de conexiones
        extra: {
          max: 20, // Máximo de conexiones
          min: 5, // Mínimo de conexiones
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },

        // Retry logic
        retryAttempts: 3,
        retryDelay: 3000,

        // Auto-load entities (alternativa a la ruta manual)
        autoLoadEntities: true,
      }),
    }),
  ],
})
export class DatabaseModule {}

/**
 * NOTA IMPORTANTE:
 * 
 * - synchronize: true solo en desarrollo! Nunca en producción
 * - Para producción usa migraciones: npm run migration:generate
 * - Las entities se auto-cargan desde cualquier módulo que use TypeOrmModule.forFeature()
 * 
 * Ejemplo de uso en un módulo de feature:
 * 
 * @Module({
 *   imports: [TypeOrmModule.forFeature([UserEntity])],
 *   ...
 * })
 * export class UsersModule {}
 */

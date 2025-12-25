/**
 * ===============================================
 * APP MODULE
 * Módulo raíz de la aplicación
 * ===============================================
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from './core/config/config.module';
import { DatabaseModule } from './core/database/database.module';
import { LoggerModule } from './core/logger/logger.module';
import { HealthModule } from './core/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Core modules
    ConfigModule,
    DatabaseModule,
    LoggerModule,
    HealthModule,

    // Feature modules
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


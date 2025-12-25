/**
 * ===============================================
 * APP SERVICE
 * Servicio raíz de la aplicación
 * ===============================================
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  /**
   * Información de la API
   */
  getInfo() {
    return {
      name: this.configService.get<string>('APP_NAME', 'Master TypeScript API'),
      version: this.configService.get<string>('APP_VERSION', '2.0.0'),
      description: 'API production-ready con NestJS + TypeScript',
      documentation: '/api/docs',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
    };
  }
}


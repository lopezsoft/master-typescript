/**
 * ===============================================
 * APP CONTROLLER
 * Controlador raíz de la aplicación
 * ===============================================
 */

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './modules/auth/guards/jwt-auth.guard';

@ApiTags('General')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint raíz - Información de la API
   * GET /api/v1
   */
  @Public()
  @Get()
  @ApiOperation({ summary: 'Información de la API' })
  @ApiResponse({
    status: 200,
    description: 'Información de la API',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        version: { type: 'string' },
        description: { type: 'string' },
        documentation: { type: 'string' },
      },
    },
  })
  getInfo() {
    return this.appService.getInfo();
  }
}


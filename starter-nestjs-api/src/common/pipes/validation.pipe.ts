/**
 * ===============================================
 * VALIDATION PIPE CONFIGURATION
 * Configuración global de validación
 * ===============================================
 */

import { ValidationPipe, ValidationError } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

/**
 * Factory para crear ValidationPipe configurado
 */
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    // Transformar tipos automáticamente
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },

    // Eliminar propiedades no definidas en el DTO
    whitelist: true,

    // Lanzar error si hay propiedades no permitidas
    forbidNonWhitelisted: true,

    // Validar siempre (incluso objetos nested)
    validateCustomDecorators: true,

    // Mensaje de error personalizado
    exceptionFactory: (errors: ValidationError[]) => {
      const messages = errors.map((error) => ({
        field: error.property,
        errors: Object.values(error.constraints || {}),
      }));

      return new BadRequestException({
        message: 'Error de validación',
        errors: messages,
      });
    },
  });
}

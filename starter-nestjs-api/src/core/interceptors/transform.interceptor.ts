/**
 * ===============================================
 * INTERCEPTOR DE TRANSFORMACIÓN
 * Estandariza el formato de todas las respuestas
 * ===============================================
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Estructura de respuesta exitosa estandarizada
 */
export interface ResponseFormat<T> {
  statusCode: number;
  message?: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseFormat<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => ({
        statusCode: response.statusCode,
        message: data?.message || 'Success',
        data: data?.data !== undefined ? data.data : data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

/**
 * EJEMPLO DE RESPUESTA:
 * 
 * {
 *   "statusCode": 200,
 *   "message": "Success",
 *   "data": {
 *     "id": 1,
 *     "name": "John Doe"
 *   },
 *   "timestamp": "2025-12-24T10:30:00.000Z"
 * }
 */

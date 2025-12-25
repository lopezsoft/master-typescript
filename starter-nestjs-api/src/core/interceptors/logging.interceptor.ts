/**
 * ===============================================
 * INTERCEPTOR DE LOGGING
 * Registra todas las peticiones y respuestas
 * ===============================================
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AppLoggerService } from '../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {
    this.logger.setContext(LoggingInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const { statusCode } = response;
          const responseTime = Date.now() - startTime;

          this.logger.logWithMetadata('info', 'HTTP Request', {
            method,
            url,
            statusCode,
            responseTime: `${responseTime}ms`,
            ip,
            userAgent,
          });
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;

          this.logger.logWithMetadata('error', 'HTTP Request Error', {
            method,
            url,
            statusCode: error.status || 500,
            responseTime: `${responseTime}ms`,
            ip,
            userAgent,
            error: error.message,
          });
        },
      }),
    );
  }
}

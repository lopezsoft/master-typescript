/**
 * ===============================================
 * LOGGER SERVICE - WINSTON
 * Sistema de logging profesional con rotación de archivos
 * ===============================================
 */

import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as path from 'path';

@Injectable()
export class AppLoggerService implements LoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor(private configService: ConfigService, context?: string) {
    this.context = context;
    this.logger = this.createLogger();
  }

  /**
   * Crear instancia de Winston Logger
   */
  private createLogger(): winston.Logger {
    const logLevel = this.configService.get<string>('LOG_LEVEL', 'info');
    const logPath = this.configService.get<string>('LOG_FILE_PATH', './logs');
    const env = this.configService.get<string>('NODE_ENV', 'development');

    // Formato personalizado
    const customFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
    );

    // Formato para consola (más legible)
    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, context, trace }) => {
        const ctx = context ? `[${context}]` : '';
        return `${timestamp} ${level} ${ctx} ${message}${trace ? `\n${trace}` : ''}`;
      }),
    );

    // Transportes
    const transports: winston.transport[] = [
      // Consola
      new winston.transports.Console({
        format: consoleFormat,
      }),
    ];

    // Solo archivos en producción/staging
    if (env !== 'test') {
      transports.push(
        // Todos los logs
        new winston.transports.File({
          filename: path.join(logPath, 'app.log'),
          format: customFormat,
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // Solo errores
        new winston.transports.File({
          filename: path.join(logPath, 'error.log'),
          level: 'error',
          format: customFormat,
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      );
    }

    return winston.createLogger({
      level: logLevel,
      format: customFormat,
      transports,
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(logPath, 'exceptions.log'),
        }),
      ],
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(logPath, 'rejections.log'),
        }),
      ],
    });
  }

  /**
   * Métodos del LoggerService de NestJS
   */
  log(message: string, context?: string) {
    this.logger.info(message, { context: context || this.context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, {
      context: context || this.context,
      trace,
    });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context: context || this.context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context: context || this.context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context: context || this.context });
  }

  /**
   * Método personalizado para logs estructurados
   */
  logWithMetadata(level: string, message: string, metadata: Record<string, any>) {
    this.logger.log(level, message, { ...metadata, context: this.context });
  }

  /**
   * Crear logger con contexto específico
   */
  setContext(context: string): AppLoggerService {
    this.context = context;
    return this;
  }
}

/**
 * EJEMPLOS DE USO:
 * 
 * // En un servicio
 * constructor(private logger: AppLoggerService) {
 *   this.logger.setContext(UsersService.name);
 * }
 * 
 * this.logger.log('Usuario creado exitosamente');
 * this.logger.error('Error al crear usuario', error.stack);
 * this.logger.warn('Cache no encontrada, usando base de datos');
 * 
 * // Con metadata
 * this.logger.logWithMetadata('info', 'Login exitoso', {
 *   userId: user.id,
 *   ip: req.ip,
 *   userAgent: req.headers['user-agent']
 * });
 */

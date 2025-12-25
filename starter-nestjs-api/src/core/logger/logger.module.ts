/**
 * ===============================================
 * LOGGER MODULE
 * ===============================================
 */

import { Module, Global } from '@nestjs/common';
import { AppLoggerService } from './logger.service';

@Global() // Hace que el logger esté disponible en toda la app
@Module({
  providers: [AppLoggerService],
  exports: [AppLoggerService],
})
export class LoggerModule {}

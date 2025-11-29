import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message:
        'Bienvenido al starter de NestJS para MASTER DE TYPESCRIPT · Vol. 1',
    };
  }
}

/**
 * ===============================================
 * LOCAL STRATEGY
 * Estrategia de autenticación con email/password
 * ===============================================
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // Usa email en lugar de username
      passwordField: 'password',
    });
  }

  /**
   * Valida credenciales
   */
  async validate(email: string, password: string): Promise<UserEntity> {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return user;
  }
}

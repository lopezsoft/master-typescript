/**
 * ===============================================
 * AUTH SERVICE
 * Lógica de negocio de autenticación
 * ===============================================
 */

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  UserResponseDto,
} from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Registrar nuevo usuario
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Crear usuario (el password se hashea automáticamente en @BeforeInsert)
    const user = this.userRepository.create(registerDto);
    await this.userRepository.save(user);

    // Generar tokens
    const tokens = await this.generateTokens(user);

    // Guardar refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: this.mapUserToResponse(user),
    };
  }

  /**
   * Login
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar tokens
    const tokens = await this.generateTokens(user);

    // Guardar refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: this.mapUserToResponse(user),
    };
  }

  /**
   * Validar credenciales de usuario
   */
  async validateUser(email: string, password: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Refresh tokens
   */
  async refreshTokens(userId: string, refreshToken: string): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Acceso denegado');
    }

    // Verificar refresh token
    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    // Generar nuevos tokens
    const tokens = await this.generateTokens(user);

    // Actualizar refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: this.mapUserToResponse(user),
    };
  }

  /**
   * Logout
   */
  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: null });
  }

  /**
   * Generar access y refresh tokens
   */
  private async generateTokens(user: UserEntity) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Actualizar refresh token hasheado en BD
   */
  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  /**
   * Mapear usuario a DTO de respuesta
   */
  private mapUserToResponse(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}

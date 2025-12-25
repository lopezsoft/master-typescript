/**
 * ===============================================
 * E2E TESTS - AUTH
 * Tests de autenticación
 * ===============================================
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { createValidationPipe } from '../src/common/pipes/validation.pipe';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(createValidationPipe());
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/v1/auth/register (POST)', () => {
    it('should register a new user', () => {
      const registerDto = {
        email: `test${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data).toHaveProperty('refreshToken');
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data.user.email).toBe(registerDto.email);
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
        })
        .expect(400);
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
        })
        .expect(400);
    });
  });

  describe('/api/v1/auth/login (POST)', () => {
    let testUser: any;

    beforeEach(async () => {
      // Crear usuario de prueba
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: `test${Date.now()}@example.com`,
          password: 'Password123!',
        });

      testUser = response.body.data;
    });

    it('should login successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.user.email,
          password: 'Password123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data).toHaveProperty('refreshToken');
        });
    });

    it('should fail with wrong password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.user.email,
          password: 'WrongPassword',
        })
        .expect(401);
    });
  });

  describe('/api/v1/auth/profile (GET)', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Crear y autenticar usuario
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: `test${Date.now()}@example.com`,
          password: 'Password123!',
        });

      accessToken = response.body.data.accessToken;
    });

    it('should get user profile', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('email');
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});

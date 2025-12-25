/**
 * ===============================================
 * E2E TESTS - APP
 * Tests end-to-end de la aplicación
 * ===============================================
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { createValidationPipe } from '../src/common/pipes/validation.pipe';

describe('AppController (e2e)', () => {
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

  describe('/api/v1 (GET)', () => {
    it('should return API info', () => {
      return request(app.getHttpServer())
        .get('/api/v1')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('name');
          expect(res.body.data).toHaveProperty('version');
          expect(res.body.data).toHaveProperty('description');
        });
    });
  });

  describe('/api/v1/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health/live')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('status', 'ok');
        });
    });
  });
});

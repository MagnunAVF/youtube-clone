import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  it('/users (POST) creates a user record', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({ displayName: 'Ada Lovelace' })
      .expect(201);

    expect(response.body).toMatchObject({ displayName: 'Ada Lovelace' });
    expect(response.body._id).toBeDefined();
  });

  it('/users (POST) 400s when displayName is missing', async () => {
    await request(app.getHttpServer()).post('/users').send({}).expect(400);
  });

  it('/users (POST) 400s on unknown fields', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ displayName: 'Ada Lovelace', isAdmin: true })
      .expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});

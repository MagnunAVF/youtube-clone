import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';
import { UsersService } from '../src/users/users.service';

describe('Auth (e2e)', () => {
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

  it('/auth/signup (POST) creates a user, hashes the password, and returns a JWT', async () => {
    const email = `ada-${Date.now()}@example.com`;

    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ displayName: 'Ada Lovelace', email, password: 'supersecret' })
      .expect(201);

    expect(response.body).toMatchObject({
      accessToken: expect.any(String),
      user: { displayName: 'Ada Lovelace', email },
    });
    expect(response.body.user.id).toBeDefined();
    expect((response.body.accessToken as string).split('.')).toHaveLength(3);

    const usersService = app.get(UsersService);
    const stored = await usersService.findByEmail(email);
    expect(stored?.passwordHash).toBeDefined();
    expect(stored?.passwordHash).not.toBe('supersecret');
    await expect(bcrypt.compare('supersecret', stored?.passwordHash as string)).resolves.toBe(true);
  });

  it('/auth/signup (POST) lowercases the email', async () => {
    const email = `Case-${Date.now()}@Example.com`;

    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ displayName: 'Case Test', email, password: 'supersecret' })
      .expect(201);

    expect(response.body.user.email).toBe(email.toLowerCase());
  });

  it('/auth/signup (POST) 409s when the email is already registered', async () => {
    const email = `dup-${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ displayName: 'First', email, password: 'supersecret' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ displayName: 'Second', email, password: 'anothersecret' })
      .expect(409);
  });

  it('/auth/signup (POST) 400s on an invalid email', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ displayName: 'Bad Email', email: 'not-an-email', password: 'supersecret' })
      .expect(400);
  });

  it('/auth/signup (POST) 400s when the password is too short', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        displayName: 'Short Pass',
        email: `short-${Date.now()}@example.com`,
        password: 'short',
      })
      .expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Types } from 'mongoose';
import { AppModule } from './../src/app.module';

describe('Videos (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/videos (POST) uploads the file to S3 and creates a video record', async () => {
    const uploaderId = new Types.ObjectId().toHexString();

    const response = await request(app.getHttpServer())
      .post('/videos')
      .field('title', 'My Video')
      .field('uploaderId', uploaderId)
      .attach('file', Buffer.from('fake-video-bytes'), 'clip.mp4')
      .expect(201);

    expect(response.body).toMatchObject({
      title: 'My Video',
      uploaderId,
      status: 'uploaded',
    });
    expect(response.body.s3Key).toMatch(
      new RegExp(`^videos/${uploaderId}/[a-f0-9]{24}/original\\.mp4$`),
    );
  });

  afterEach(async () => {
    await app.close();
  });
});

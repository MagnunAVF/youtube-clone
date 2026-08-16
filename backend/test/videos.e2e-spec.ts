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

  it('/videos (GET) lists the created video with a resolved uploader', async () => {
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({ displayName: 'Grace Hopper' })
      .expect(201);
    const uploaderId = userResponse.body._id as string;

    const uploadResponse = await request(app.getHttpServer())
      .post('/videos')
      .field('title', 'Listed Video')
      .field('uploaderId', uploaderId)
      .attach('file', Buffer.from('fake-video-bytes'), 'clip.mp4')
      .expect(201);
    const videoId = uploadResponse.body._id as string;

    const listResponse = await request(app.getHttpServer()).get('/videos').expect(200);

    const listedVideo = (listResponse.body as { id: string }[]).find(
      (video) => video.id === videoId,
    );
    expect(listedVideo).toMatchObject({
      id: videoId,
      title: 'Listed Video',
      thumbnailUrl: null,
      uploader: { id: uploaderId, displayName: 'Grace Hopper' },
    });
  });

  afterEach(async () => {
    await app.close();
  });
});

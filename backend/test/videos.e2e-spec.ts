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

  it('/videos/:id (GET) fetches metadata and a working playback URL', async () => {
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({ displayName: 'Katherine Johnson' })
      .expect(201);
    const uploaderId = userResponse.body._id as string;

    const fileContents = 'fake-video-bytes-for-detail-test';
    const uploadResponse = await request(app.getHttpServer())
      .post('/videos')
      .field('title', 'Detail Video')
      .field('description', 'A video for the detail endpoint test')
      .field('uploaderId', uploaderId)
      .attach('file', Buffer.from(fileContents), 'clip.mp4')
      .expect(201);
    const videoId = uploadResponse.body._id as string;

    const detailResponse = await request(app.getHttpServer())
      .get(`/videos/${videoId}`)
      .expect(200);

    expect(detailResponse.body).toMatchObject({
      id: videoId,
      title: 'Detail Video',
      description: 'A video for the detail endpoint test',
      status: 'uploaded',
      thumbnailUrl: null,
      uploader: { id: uploaderId, displayName: 'Katherine Johnson' },
    });
    expect(typeof detailResponse.body.playbackUrl).toBe('string');

    const playbackResponse = await fetch(detailResponse.body.playbackUrl as string);
    expect(playbackResponse.ok).toBe(true);
    expect(await playbackResponse.text()).toBe(fileContents);
  });

  it('/videos/:id (GET) 404s for a video that does not exist', async () => {
    const missingId = new Types.ObjectId().toHexString();

    await request(app.getHttpServer()).get(`/videos/${missingId}`).expect(404);
  });

  afterEach(async () => {
    await app.close();
  });
});

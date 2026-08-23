import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
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
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  async function signUp(displayName: string) {
    const email = `${displayName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}@example.com`;
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ displayName, email, password: 'supersecret' })
      .expect(201);

    return {
      accessToken: response.body.accessToken as string,
      uploaderId: response.body.user.id as string,
    };
  }

  it('/videos (POST) uploads the file to S3 and creates a video record for the logged-in user', async () => {
    const { accessToken, uploaderId } = await signUp('Ada Lovelace');

    const response = await request(app.getHttpServer())
      .post('/videos')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('title', 'My Video')
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

  it('/videos (POST) 401s without an Authorization header', async () => {
    await request(app.getHttpServer())
      .post('/videos')
      .field('title', 'My Video')
      .attach('file', Buffer.from('fake-video-bytes'), 'clip.mp4')
      .expect(401);
  });

  it('/videos (POST) 401s with an invalid token', async () => {
    await request(app.getHttpServer())
      .post('/videos')
      .set('Authorization', 'Bearer not-a-real-token')
      .field('title', 'My Video')
      .attach('file', Buffer.from('fake-video-bytes'), 'clip.mp4')
      .expect(401);
  });

  it('/videos (GET) lists the created video with a resolved uploader — no auth required', async () => {
    const { accessToken, uploaderId } = await signUp('Grace Hopper');

    const uploadResponse = await request(app.getHttpServer())
      .post('/videos')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('title', 'Listed Video')
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

  it('/videos/:id (GET) fetches metadata and a working playback URL — no auth required', async () => {
    const { accessToken, uploaderId } = await signUp('Katherine Johnson');

    const fileContents = 'fake-video-bytes-for-detail-test';
    const uploadResponse = await request(app.getHttpServer())
      .post('/videos')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('title', 'Detail Video')
      .field('description', 'A video for the detail endpoint test')
      .attach('file', Buffer.from(fileContents), 'clip.mp4')
      .expect(201);
    const videoId = uploadResponse.body._id as string;

    const detailResponse = await request(app.getHttpServer()).get(`/videos/${videoId}`).expect(200);

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

  it('/videos/:id (GET) 400s for a malformed id', async () => {
    await request(app.getHttpServer()).get('/videos/not-an-object-id').expect(400);
  });

  it('/videos (POST) 400s when the title is missing', async () => {
    const { accessToken } = await signUp('Missing Title');

    await request(app.getHttpServer())
      .post('/videos')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', Buffer.from('fake-video-bytes'), 'clip.mp4')
      .expect(400);
  });

  it('/videos (POST) 400s when no file is attached', async () => {
    const { accessToken } = await signUp('No File');

    await request(app.getHttpServer())
      .post('/videos')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('title', 'My Video')
      .expect(400);
  });

  it('/videos (POST) 400s when the file is not a video', async () => {
    const { accessToken } = await signUp('Not A Video');

    await request(app.getHttpServer())
      .post('/videos')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('title', 'My Video')
      .attach('file', Buffer.from('not a video'), {
        filename: 'notes.txt',
        contentType: 'text/plain',
      })
      .expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});

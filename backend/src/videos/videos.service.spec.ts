import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { VideosService } from './videos.service';
import { Video } from './schemas/video.schema';
import { S3_CLIENT, S3_PRESIGN_CLIENT } from '../storage/storage.constants';

jest.mock('@aws-sdk/s3-request-presigner');

describe('VideosService', () => {
  let service: VideosService;
  const findQuery = { sort: jest.fn(), populate: jest.fn(), exec: jest.fn() };
  const findByIdQuery = { populate: jest.fn(), exec: jest.fn() };
  const videoModel = {
    create: jest.fn(),
    find: jest.fn(() => findQuery),
    findById: jest.fn(() => findByIdQuery),
  };
  const s3Client = { send: jest.fn() };
  const s3PresignClient = { send: jest.fn() };
  const getSignedUrlMock = jest.mocked(getSignedUrl);

  beforeEach(async () => {
    findQuery.sort.mockReturnValue(findQuery);
    findQuery.populate.mockReturnValue(findQuery);
    findByIdQuery.populate.mockReturnValue(findByIdQuery);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideosService,
        { provide: getModelToken(Video.name), useValue: videoModel },
        { provide: S3_CLIENT, useValue: s3Client },
        { provide: S3_PRESIGN_CLIENT, useValue: s3PresignClient },
        { provide: ConfigService, useValue: { get: () => 'videos' } },
      ],
    }).compile();

    service = module.get<VideosService>(VideosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('uploads the file to S3 and creates a video document referencing the uploader', async () => {
    const dto = { title: 'My Video' };
    const uploaderId = '507f1f77bcf86cd799439011';
    const file = {
      originalname: 'clip.mp4',
      mimetype: 'video/mp4',
      buffer: Buffer.from('fake-video-bytes'),
    } as Express.Multer.File;
    videoModel.create.mockResolvedValue({ _id: 'created' });

    await service.create(dto, uploaderId, file);

    expect(s3Client.send).toHaveBeenCalledTimes(1);
    const putCommand = s3Client.send.mock.calls[0][0];
    expect(putCommand.input.Bucket).toBe('videos');
    expect(putCommand.input.Key).toMatch(
      /^videos\/507f1f77bcf86cd799439011\/[a-f0-9]{24}\/original\.mp4$/,
    );
    expect(putCommand.input.Body).toBe(file.buffer);

    expect(videoModel.create).toHaveBeenCalledTimes(1);
    const created = videoModel.create.mock.calls[0][0];
    expect(created.title).toBe(dto.title);
    expect(created.uploaderId.toString()).toBe(uploaderId);
    expect(created.s3Key).toBe(putCommand.input.Key);
  });

  it('lists videos newest-first with a resolved uploader and placeholder thumbnail', async () => {
    findQuery.exec.mockResolvedValue([
      {
        _id: { toString: () => 'video-1' },
        title: 'My Video',
        uploaderId: { _id: { toString: () => 'user-1' }, displayName: 'Ada Lovelace' },
      },
      {
        _id: { toString: () => 'video-2' },
        title: 'Orphaned Video',
        uploaderId: null,
      },
    ]);

    const result = await service.findAll();

    expect(videoModel.find).toHaveBeenCalledTimes(1);
    expect(findQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(findQuery.populate).toHaveBeenCalledWith('uploaderId');
    expect(result).toEqual([
      {
        id: 'video-1',
        title: 'My Video',
        thumbnailUrl: null,
        uploader: { id: 'user-1', displayName: 'Ada Lovelace' },
      },
      {
        id: 'video-2',
        title: 'Orphaned Video',
        thumbnailUrl: null,
        uploader: null,
      },
    ]);
  });

  describe('findOne', () => {
    it('returns video metadata with a presigned playback URL', async () => {
      const createdAt = new Date('2026-01-01T00:00:00.000Z');
      findByIdQuery.exec.mockResolvedValue({
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        title: 'My Video',
        description: 'A video',
        status: 'uploaded',
        s3Key: 'videos/uploader-1/507f1f77bcf86cd799439011/original.mp4',
        uploaderId: { _id: { toString: () => 'user-1' }, displayName: 'Ada Lovelace' },
        createdAt,
      });
      getSignedUrlMock.mockResolvedValue('https://videos.example.com/signed-url');

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(videoModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(findByIdQuery.populate).toHaveBeenCalledWith('uploaderId');
      const [presignClientArg, getObjectCommand, options] = getSignedUrlMock.mock.calls[0];
      // Playback URLs must be signed with the browser-facing client, not the internal one used
      // for the backend's own S3 calls - see storage.module.ts.
      expect(presignClientArg).toBe(s3PresignClient);
      expect(getObjectCommand.input).toMatchObject({
        Bucket: 'videos',
        Key: 'videos/uploader-1/507f1f77bcf86cd799439011/original.mp4',
      });
      expect(options).toEqual({ expiresIn: 3600 });
      expect(result).toEqual({
        id: '507f1f77bcf86cd799439011',
        title: 'My Video',
        description: 'A video',
        status: 'uploaded',
        thumbnailUrl: null,
        uploader: { id: 'user-1', displayName: 'Ada Lovelace' },
        playbackUrl: 'https://videos.example.com/signed-url',
        createdAt,
      });
    });

    it('throws NotFoundException when no video matches the id', async () => {
      findByIdQuery.exec.mockResolvedValue(null);

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });
  });
});

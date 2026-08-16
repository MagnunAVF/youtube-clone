import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { VideosService } from './videos.service';
import { Video } from './schemas/video.schema';
import { S3_CLIENT } from '../storage/storage.constants';

describe('VideosService', () => {
  let service: VideosService;
  const findQuery = { sort: jest.fn(), populate: jest.fn(), exec: jest.fn() };
  const videoModel = { create: jest.fn(), find: jest.fn(() => findQuery) };
  const s3Client = { send: jest.fn() };

  beforeEach(async () => {
    findQuery.sort.mockReturnValue(findQuery);
    findQuery.populate.mockReturnValue(findQuery);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideosService,
        { provide: getModelToken(Video.name), useValue: videoModel },
        { provide: S3_CLIENT, useValue: s3Client },
        { provide: ConfigService, useValue: { get: () => 'videos' } },
      ],
    }).compile();

    service = module.get<VideosService>(VideosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('uploads the file to S3 and creates a video document referencing the uploader', async () => {
    const dto = { title: 'My Video', uploaderId: '507f1f77bcf86cd799439011' };
    const file = {
      originalname: 'clip.mp4',
      mimetype: 'video/mp4',
      buffer: Buffer.from('fake-video-bytes'),
    } as Express.Multer.File;
    videoModel.create.mockResolvedValue({ _id: 'created' });

    await service.create(dto, file);

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
    expect(created.uploaderId.toString()).toBe(dto.uploaderId);
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
});

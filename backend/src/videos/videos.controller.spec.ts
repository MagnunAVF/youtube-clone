import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';

describe('VideosController', () => {
  let controller: VideosController;
  const videosService = { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn() };
  const currentUser = { _id: { toString: () => '507f1f77bcf86cd799439011' }, displayName: 'Ada' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideosController],
      providers: [{ provide: VideosService, useValue: videosService }],
    }).compile();

    controller = module.get<VideosController>(VideosController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('delegates creation to the service with the uploaded file and the current user', async () => {
    const dto = { title: 'My Video' };
    const file = { originalname: 'clip.mp4' } as Express.Multer.File;
    const created = { _id: '1', ...dto };
    videosService.create.mockResolvedValue(created);

    const result = await controller.create(dto, file, currentUser as never);

    expect(videosService.create).toHaveBeenCalledWith(dto, '507f1f77bcf86cd799439011', file);
    expect(result).toEqual(created);
  });

  it('rejects when no file is uploaded', async () => {
    const dto = { title: 'My Video' };

    await expect(
      controller.create(dto, undefined as unknown as Express.Multer.File, currentUser as never),
    ).rejects.toThrow(BadRequestException);
    expect(videosService.create).not.toHaveBeenCalled();
  });

  it('delegates listing to the service', async () => {
    const videos = [{ id: '1', title: 'My Video', thumbnailUrl: null, uploader: null }];
    videosService.findAll.mockResolvedValue(videos);

    const result = await controller.findAll();

    expect(videosService.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(videos);
  });

  it('delegates fetching a single video to the service', async () => {
    const video = {
      id: '1',
      title: 'My Video',
      status: 'uploaded',
      thumbnailUrl: null,
      uploader: null,
      playbackUrl: 'https://videos.example.com/signed-url',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    videosService.findOne.mockResolvedValue(video);

    const result = await controller.findOne('1');

    expect(videosService.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual(video);
  });
});

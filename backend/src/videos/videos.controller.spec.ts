import { Test, TestingModule } from '@nestjs/testing';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';

describe('VideosController', () => {
  let controller: VideosController;
  const videosService = { create: jest.fn(), findAll: jest.fn() };

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

  it('delegates creation to the service with the uploaded file', async () => {
    const dto = { title: 'My Video', uploaderId: '507f1f77bcf86cd799439011' };
    const file = { originalname: 'clip.mp4' } as Express.Multer.File;
    const created = { _id: '1', ...dto };
    videosService.create.mockResolvedValue(created);

    const result = await controller.create(dto, file);

    expect(videosService.create).toHaveBeenCalledWith(dto, file);
    expect(result).toEqual(created);
  });

  it('delegates listing to the service', async () => {
    const videos = [{ id: '1', title: 'My Video', thumbnailUrl: null, uploader: null }];
    videosService.findAll.mockResolvedValue(videos);

    const result = await controller.findAll();

    expect(videosService.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(videos);
  });
});

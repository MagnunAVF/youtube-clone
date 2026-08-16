import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoListItemDto } from './dto/video-list-item.dto';
import { VideoDetailDto } from './dto/video-detail.dto';
import { VideoDocument } from './schemas/video.schema';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';

const MAX_VIDEO_FILE_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2GB

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_VIDEO_FILE_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('video/')) {
          callback(new BadRequestException('Only video files are allowed'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async create(
    @Body() createVideoDto: CreateVideoDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<VideoDocument> {
    if (!file) {
      throw new BadRequestException('A video file is required');
    }
    return this.videosService.create(createVideoDto, file);
  }

  @Get()
  findAll(): Promise<VideoListItemDto[]> {
    return this.videosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<VideoDetailDto> {
    return this.videosService.findOne(id);
  }
}

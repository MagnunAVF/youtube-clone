import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoListItemDto } from './dto/video-list-item.dto';
import { VideoDetailDto } from './dto/video-detail.dto';
import { VideoDocument } from './schemas/video.schema';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createVideoDto: CreateVideoDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<VideoDocument> {
    return this.videosService.create(createVideoDto, file);
  }

  @Get()
  findAll(): Promise<VideoListItemDto[]> {
    return this.videosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<VideoDetailDto> {
    return this.videosService.findOne(id);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { extname } from 'node:path';
import { Video, VideoDocument } from './schemas/video.schema';
import { CreateVideoDto } from './dto/create-video.dto';
import { S3_CLIENT } from '../storage/storage.constants';

@Injectable()
export class VideosService {
  private readonly bucket: string;

  constructor(
    @InjectModel(Video.name) private readonly videoModel: Model<VideoDocument>,
    @Inject(S3_CLIENT) private readonly s3Client: S3Client,
    configService: ConfigService,
  ) {
    this.bucket = configService.get<string>('S3_BUCKET_NAME', 'videos');
  }

  async create(
    createVideoDto: CreateVideoDto,
    file: Express.Multer.File,
  ): Promise<VideoDocument> {
    const videoId = new Types.ObjectId();
    // Key convention: videos/{userId}/{videoId}/original.<ext>
    const s3Key = `videos/${createVideoDto.uploaderId}/${videoId.toHexString()}/original${extname(file.originalname)}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return this.videoModel.create({
      _id: videoId,
      title: createVideoDto.title,
      description: createVideoDto.description,
      s3Key,
      uploaderId: new Types.ObjectId(createVideoDto.uploaderId),
    });
  }
}

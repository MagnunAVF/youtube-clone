import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VideoDocument = HydratedDocument<Video>;

export enum VideoStatus {
  Uploaded = 'uploaded',
}

@Schema({ timestamps: true })
export class Video {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true })
  s3Key: string;

  @Prop({ required: true, enum: VideoStatus, default: VideoStatus.Uploaded })
  status: VideoStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploaderId: Types.ObjectId;
}

export const VideoSchema = SchemaFactory.createForClass(Video);

VideoSchema.index({ createdAt: -1 });

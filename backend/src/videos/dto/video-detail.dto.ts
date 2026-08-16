export class VideoDetailDto {
  id: string;
  title: string;
  description?: string;
  status: string;
  thumbnailUrl: string | null;
  uploader: { id: string; displayName: string } | null;
  playbackUrl: string;
  createdAt: Date;
}

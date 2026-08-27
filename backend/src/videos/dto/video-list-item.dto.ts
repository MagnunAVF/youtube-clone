export class VideoListItemDto {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  uploader: { id: string; displayName: string } | null;
}

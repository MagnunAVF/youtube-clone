export interface VideoRecord {
  _id: string;
  title: string;
  description?: string;
  s3Key: string;
  status: string;
  uploaderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoListItem {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  uploader: { id: string; displayName: string } | null;
}

export interface VideoDetail {
  id: string;
  title: string;
  description?: string;
  status: string;
  thumbnailUrl: string | null;
  uploader: { id: string; displayName: string } | null;
  playbackUrl: string;
  createdAt: string;
}

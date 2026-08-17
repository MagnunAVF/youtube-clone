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

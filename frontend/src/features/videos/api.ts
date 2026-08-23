import type { VideoDetail, VideoListItem, VideoRecord } from './types';
import { API_BASE_URL } from '../../lib/config';
import { apiClient, ApiError } from '../../lib/apiClient';
import { getAccessToken } from '../auth/session';

export function fetchVideos(): Promise<VideoListItem[]> {
  return apiClient.get<VideoListItem[]>('/videos');
}

export function fetchVideo(id: string): Promise<VideoDetail> {
  return apiClient.get<VideoDetail>(`/videos/${id}`);
}

export interface CreateVideoInput {
  title: string;
  description?: string;
  file: File;
}

// Progress reporting during upload requires XMLHttpRequest - apiClient (fetch-based) has no upload progress event.
export function uploadVideo(
  input: CreateVideoInput,
  onProgress?: (percent: number) => void,
): Promise<VideoRecord> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('title', input.title);
    if (input.description) {
      formData.append('description', input.description);
    }
    formData.append('file', input.file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/videos`);
    const accessToken = getAccessToken();
    if (accessToken) {
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as VideoRecord);
      } else {
        reject(new ApiError('Upload failed', xhr.status));
      }
    };

    xhr.onerror = () => reject(new ApiError('Upload failed', 0));

    xhr.send(formData);
  });
}

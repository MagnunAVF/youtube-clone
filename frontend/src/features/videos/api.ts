import type { VideoRecord } from './types';
import { API_BASE_URL } from '../../lib/config';

export interface CreateVideoInput {
  title: string;
  description?: string;
  uploaderId: string;
  file: File;
}

// Progress reporting during upload requires XMLHttpRequest - fetch has no upload progress event.
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
    formData.append('uploaderId', input.uploaderId);
    formData.append('file', input.file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/videos`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as VideoRecord);
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed'));

    xhr.send(formData);
  });
}

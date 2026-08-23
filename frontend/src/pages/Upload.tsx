import { useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthSession } from '../features/auth/AuthSessionContext';
import { uploadVideo } from '../features/videos/api';
import type { VideoRecord } from '../features/videos/types';
import { ApiError } from '../lib/apiClient';
import './Upload.css';

export function Upload() {
  const { user, logout } = useAuthSession();
  const formRef = useRef<HTMLFormElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VideoRecord | null>(null);

  const isUploading = progress !== null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !file || !title.trim()) return;

    setError(null);
    setResult(null);
    setProgress(0);

    try {
      const video = await uploadVideo(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          file,
        },
        setProgress,
      );
      setResult(video);
      setTitle('');
      setDescription('');
      setFile(null);
      formRef.current?.reset();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Your session expired. Please sign in again.');
        logout();
      } else {
        setError('Upload failed. Try again.');
      }
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="upload-page">
      <h1>Upload a video</h1>

      {error && <p className="upload-error">{error}</p>}

      {user ? (
        <>
          <form ref={formRef} onSubmit={handleSubmit}>
            <label>
              Title
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </label>

            <label>
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
              />
            </label>

            <label>
              Video file
              <input
                type="file"
                accept="video/*"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                required
              />
            </label>

            <button type="submit" disabled={isUploading || !file || !title.trim()}>
              {isUploading ? `Uploading… ${progress}%` : 'Upload'}
            </button>
          </form>

          {isUploading && (
            <div
              className="upload-progress"
              role="progressbar"
              aria-valuenow={progress ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="upload-progress__bar" style={{ width: `${progress}%` }} />
            </div>
          )}

          {result && (
            <p className="upload-result">
              Uploaded "{result.title}" - status: {result.status}
            </p>
          )}
        </>
      ) : (
        <p>
          <Link to="/signin">Sign in</Link> to upload a video.
        </p>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchVideos } from '../features/videos/api';
import type { VideoListItem } from '../features/videos/types';
import './Home.css';

export function Home() {
  const [videos, setVideos] = useState<VideoListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchVideos()
      .then((data) => {
        if (!cancelled) setVideos(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load videos.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (videos === null) {
    return <p>Loading videos…</p>;
  }

  if (videos.length === 0) {
    return <p>No videos yet. Be the first to upload one.</p>;
  }

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <Link className="video-card" to={`/watch/${video.id}`} key={video.id}>
          <div className="video-card__thumbnail" aria-hidden="true" />
          <p className="video-card__title">{video.title}</p>
          {video.uploader && (
            <p className="video-card__uploader">{video.uploader.displayName}</p>
          )}
        </Link>
      ))}
    </div>
  );
}

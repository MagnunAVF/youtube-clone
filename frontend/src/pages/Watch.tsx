import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchVideo } from '../features/videos/api';
import type { VideoDetail } from '../features/videos/types';
import './Watch.css';

export function Watch() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setVideo(null);
    setError(null);

    fetchVideo(id)
      .then((data) => {
        if (!cancelled) setVideo(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load this video.');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return <p>{error}</p>;
  }

  if (video === null) {
    return <p>Loading video…</p>;
  }

  return (
    <div className="watch-page">
      <video className="watch-page__player" src={video.playbackUrl} controls autoPlay />
      <h1 className="watch-page__title">{video.title}</h1>
      {video.uploader && <p className="watch-page__uploader">{video.uploader.displayName}</p>}
      {video.description && <p className="watch-page__description">{video.description}</p>}
    </div>
  );
}

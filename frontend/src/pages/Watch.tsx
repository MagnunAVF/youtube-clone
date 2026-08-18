import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import shaka from 'shaka-player';
import { fetchVideo } from '../features/videos/api';
import type { VideoDetail } from '../features/videos/types';
import './Watch.css';

shaka.polyfill.installAll();
const isPlaybackSupported = shaka.Player.isBrowserSupported();

export function Watch() {
  const { id } = useParams<{ id: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
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

  useEffect(() => {
    if (!video || !videoRef.current) return;

    if (!isPlaybackSupported) {
      setError('Video playback is not supported in this browser.');
      return;
    }

    let cancelled = false;
    const player = new shaka.Player();
    player.addEventListener('error', () => {
      if (!cancelled) setError('Could not play this video.');
    });

    player
      .attach(videoRef.current)
      .then(() => player.load(video.playbackUrl))
      .catch(() => {
        if (!cancelled) setError('Could not play this video.');
      });

    return () => {
      cancelled = true;
      player.destroy();
    };
  }, [video]);

  if (error) {
    return <p>{error}</p>;
  }

  if (video === null) {
    return <p>Loading video…</p>;
  }

  return (
    <div className="watch-page">
      <video ref={videoRef} className="watch-page__player" controls autoPlay />
      <h1 className="watch-page__title">{video.title}</h1>
      {video.uploader && <p className="watch-page__uploader">{video.uploader.displayName}</p>}
      {video.description && <p className="watch-page__description">{video.description}</p>}
    </div>
  );
}

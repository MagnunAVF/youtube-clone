import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// A real, tiny (1s, 320x240) H.264/AAC clip - small enough to commit, valid enough to
// actually upload and play, so tests don't depend on ffmpeg being available at run time.
export const SAMPLE_VIDEO_PATH = path.join(__dirname, 'sample-clip.mp4');

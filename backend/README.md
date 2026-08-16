# Backend

Node.js + TypeScript API server, built with NestJS.

## Development

```bash
pnpm --filter youtube-backend run start:dev
```

## Build

```bash
pnpm --filter youtube-backend run build
```

## Test

```bash
pnpm --filter youtube-backend run test
pnpm --filter youtube-backend run test:e2e
```

## Object storage

Raw uploaded video files are stored in S3 (or the local MinIO equivalent, see root `docker-compose.yml`) under the key convention:

```
videos/{userId}/{videoId}/original.<ext>
```

Grouping by uploader keeps a user's objects together and avoids key collisions without needing a separate lookup.

# Frontend

React + Vite + TypeScript web client.

## Development against the Docker Compose backend

From the repo root, start MongoDB, MinIO, and the backend API:

```bash
docker compose up -d
```

Then, in another terminal, run the frontend dev server:

```bash
cp frontend/.env.example frontend/.env
pnpm --filter youtube-frontend run dev
```

The frontend runs at `http://localhost:5173` and talks to the backend at
`http://localhost:3000` via `VITE_API_URL` (already the default in `.env.example`).
The Compose backend's `CORS_ORIGIN` already allows `http://localhost:5173`, so no
extra configuration is needed - just start both and go.

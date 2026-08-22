# Build context is the repo root (this is a pnpm workspace) - see docker-compose.yml.

FROM node:24-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN pnpm install --frozen-lockfile --filter youtube-backend

FROM deps AS build
COPY backend backend
RUN pnpm --filter youtube-backend run build

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY backend/package.json ./backend/package.json
EXPOSE 3000
CMD ["node", "backend/dist/main.js"]

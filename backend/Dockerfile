# Build context is the repo root (this is a pnpm workspace) - see docker-compose.yml.

FROM node:24-alpine AS base
# The upstream image tag lags behind Alpine's package repos on OS-level security fixes -
# upgrade at build time so the image doesn't ship known-fixed CVEs (e.g. OpenSSL) just
# because node:24-alpine hasn't been rebuilt yet.
RUN apk upgrade --no-cache
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
# The runtime only ever runs `node`; npm/npx/corepack are unused here and just add scan surface.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=deps --chown=node:node /app/backend/node_modules ./backend/node_modules
COPY --from=build --chown=node:node /app/backend/dist ./backend/dist
COPY --chown=node:node backend/package.json ./backend/package.json
USER node
EXPOSE 3000
CMD ["node", "backend/dist/main.js"]

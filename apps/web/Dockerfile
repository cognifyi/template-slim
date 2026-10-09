# ── builder ──────────────────────────────────────────────────────────────
FROM node:24-slim AS builder

ENV CI=true

RUN apt-get update && apt-get install -y --no-install-recommends \
      bash curl python3 make g++ && \
    rm -rf /var/lib/apt/lists/*
RUN npm install -g corepack && corepack enable

WORKDIR /template-slim

# Yarn caching layer
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

# Nx + TS config
COPY nx.json tsconfig.base.json .nxignore ./

# App source
COPY apps/web/ apps/web/

ENV NX_DAEMON=false
# API URL baked for the browser bundle; override per environment at build time.
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN yarn nx build web --configuration=production --nxBail=true

# ── runtime ──────────────────────────────────────────────────────────────
FROM node:24-slim AS web

ENV CI=true
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /template-slim

# Next.js standalone output: minimal server + static assets.
COPY --from=builder /template-slim/apps/web/.next/standalone ./
COPY --from=builder /template-slim/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /template-slim/apps/web/public ./apps/web/public

ARG VERSION=0.0.1
ENV VERSION=${VERSION}
ENV PORT=3000
EXPOSE 3000

HEALTHCHECK CMD [ "curl", "-f", "http://localhost:3000/health" ]

ENTRYPOINT ["node", "apps/web/server.js"]

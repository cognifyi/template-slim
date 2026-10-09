# ── builder ──────────────────────────────────────────────────────────────
FROM node:24-slim AS builder

ENV CI=true

# Build toolchain (python3/python3-setuptools/make/g++) is only needed to compile
# the bundle and any native devDependencies — it stays out of the runtime image.
# python3-setuptools provides the distutils module node-gyp needs on Python 3.12+.
RUN apt-get update && apt-get install -y --no-install-recommends \
      bash curl python3 python3-setuptools make g++ && \
    rm -rf /var/lib/apt/lists/*
RUN npm install -g corepack && corepack enable

WORKDIR /template-slim

# Yarn caching layer
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

# Nx + TS config
COPY nx.json tsconfig.base.json .nxignore ./

# App source
COPY apps/api/ apps/api/

# Lib dependencies
COPY libs/api-client/ libs/api-client/
COPY libs/sdk-typescript/ libs/sdk-typescript/

ENV NX_DAEMON=false

RUN yarn nx build api --configuration=production --nxBail=true

# ── runtime ──────────────────────────────────────────────────────────────
FROM node:24-slim AS api

ENV CI=true

RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*
# Pin corepack's home to a shared, world-readable path and pre-fetch the pinned
# yarn release at build time. Without this, a pod running as a non-root user
# (e.g. a hardened k8s securityContext) gets a different $HOME, misses the
# root-owned corepack cache, and corepack tries to download yarn from
# repo.yarnpkg.com at startup — which fails on air-gapped/egress-restricted
# clusters running the migration jobs.
ENV COREPACK_HOME=/opt/corepack
RUN npm install -g corepack && corepack enable && \
    corepack prepare yarn@4.13.0 --activate && \
    chmod -R a+rX /opt/corepack

WORKDIR /template-slim

# Nx (generatePackageJson) emits a pruned manifest + pruned lockfile carrying
# only the api bundle's runtime closure. apps/api/package.json augments it with
# runtime deps Nx's static scan misses: @openfeature/core (a non-optional peer
# of @openfeature/server-sdk) and pg (typeorm's Postgres driver, loaded via a
# dynamic require). It also adds the typeorm-migration toolchain (ts-node,
# tsconfig-paths, typescript, reflect-metadata, dotenv) plus the migration:run:*
# scripts, so the deploy migration init/pre/post-deploy jobs run from this image.
# corepack hydrates yarn from the manifest's packageManager field; .yarnrc.yml
# carries the supply-chain age gate into this install.
COPY --from=builder /template-slim/dist/apps/api/package.json /template-slim/dist/apps/api/yarn.lock ./
COPY --from=builder /template-slim/.yarnrc.yml ./

RUN yarn install --immutable

COPY --from=builder /template-slim/dist ./dist

# The migration:run:* scripts execute the typeorm CLI through ts-node against
# the TypeScript data-sources (apps/api/src/migrations/**), which load entities
# via a `*.entity.ts` glob. Ship that source + the tsconfigs they extend so the
# deploy migration jobs resolve identically to a full checkout. --chmod makes
# them world-readable: the sources carry restrictive repo perms that would
# otherwise be unreadable to a non-root migration pod.
COPY --from=builder --chmod=0755 /template-slim/apps/api/src ./apps/api/src
COPY --from=builder --chmod=0644 /template-slim/apps/api/tsconfig.json /template-slim/apps/api/tsconfig.app.json /template-slim/apps/api/tsconfig.spec.json ./apps/api/
COPY --from=builder --chmod=0644 /template-slim/tsconfig.base.json ./

ARG VERSION=0.0.1
ENV VERSION=${VERSION}

HEALTHCHECK CMD [ "curl", "-f", "http://localhost:3001/api/health" ]

ENTRYPOINT ["node", "dist/apps/api/main.js"]

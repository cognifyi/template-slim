# Agent Development Guide

This project uses **Nix flakes** to provide reproducible development environments outside of the devcontainer. When working on this codebase, use the appropriate Nix dev shell to ensure all build tools, language runtimes, and dependencies are available.

## Prerequisites

- **Nix** with flakes enabled — [install guide](https://nixos.org/download/)
- Enable flakes: add `experimental-features = nix-command flakes` to `~/.config/nix/nix.conf`

## Available Dev Shells

| Shell | Command | Languages / Tools |
|---|---|---|
| `default` | `nix develop` | Go + Node.js + Python (everything) |
| `go` | `nix develop .#go` | Go, golangci-lint, protobuf, buf |
| `node` | `nix develop .#node` | Node.js 22, Yarn 4 (via corepack) |
| `python` | `nix develop .#python` | Python 3.12, Poetry |

## Running Commands in Nix Shells

### Interactive (human use)

```bash
nix develop .#go    # drops you into a shell with Go tools
```

### Non-interactive (agent / CI use)

Use `--command` to run a single command inside the shell and exit:

```bash
nix develop .#go     --command bash -c "go build ./apps/worker/..."
nix develop .#node   --command bash -c "yarn install && yarn build"
nix develop .#python --command bash -c "poetry install && poetry run pytest"
```

For short commands you can also use:

```bash
nix develop .#go --command go test ./libs/sdk-go/...
nix develop .#go --command golangci-lint run ./apps/worker/...
```

## Project → Shell Mapping

Use this table to determine which shell to enter for a given directory.

### Go projects → `nix develop .#go`

| Directory | Description |
|---|---|
| `apps/worker` | Example background worker service |
| `libs/sdk-go` | Go SDK |
| `libs/api-client-go` | Go API client |
| `libs/common-go` | Shared Go utilities |

All Go modules are coordinated via `go.work` at the repo root.

### Node.js / TypeScript projects → `nix develop .#node`

| Directory | Description | Build |
|---|---|---|
| `apps/api` | NestJS backend API | `npx nx build api` (Webpack) |
| `apps/web` | Next.js web frontend | `npx nx build web` (Next.js) |
| `apps/docs` | Astro documentation site | `npx nx build docs` |
| `libs/sdk-typescript` | TypeScript SDK | `npx nx build sdk-typescript` |
| `libs/api-client` | TypeScript API client | `npx nx build api-client` |

All TS/Node projects are managed via **Nx** with **Yarn 4** workspaces.

### Python projects → `nix develop .#python`

| Directory | Description |
|---|---|
| `libs/sdk-python` | Python SDK |
| `libs/api-client-python` | Python API client |
| `examples/python` | Python SDK examples |
| `guides/python` | Python guides |

All Python packages are managed via **Poetry** from the root `pyproject.toml`.

## Common Build & Test Commands

### Go

```bash
# Build all Go modules
nix develop .#go --command bash -c "go build ./..."

# Build a specific app
nix develop .#go --command bash -c "go build ./apps/worker/..."

# Run tests for a specific module
nix develop .#go --command bash -c "go test ./libs/sdk-go/..."

# Run tests for all Go modules
nix develop .#go --command bash -c "go test ./..."

# Lint
nix develop .#go --command bash -c "golangci-lint run ./apps/worker/..."

# Tidy all modules
nix develop .#go --command bash -c 'for d in apps/*/go.mod libs/*/go.mod; do (cd "$(dirname "$d")" && go mod tidy); done'
```

### Node.js / TypeScript

```bash
# Install dependencies (required first)
nix develop .#node --command bash -c "yarn install"

# Build everything
nix develop .#node --command bash -c "yarn build"

# Build a specific project
nix develop .#node --command bash -c "npx nx build api"
nix develop .#node --command bash -c "npx nx build web"

# Run tests
nix develop .#node --command bash -c "npx nx test api"
nix develop .#node --command bash -c "npx nx test web"

# Lint
nix develop .#node --command bash -c "yarn lint:ts"

# Format
nix develop .#node --command bash -c "npx nx format:write"

# Serve (development)
nix develop .#node --command bash -c "npx nx serve api"
nix develop .#node --command bash -c "npx nx serve web"

# Generate API clients
nix develop .#node --command bash -c "yarn generate:api-client"

# Database migrations
nix develop .#node --command bash -c "yarn migration:run:pre-deploy"
```

### Python

```bash
# Install dependencies
nix develop .#python --command bash -c "poetry install"

# Run tests (specific lib)
nix develop .#python --command bash -c "cd libs/sdk-python && poetry run pytest"

# Lint
nix develop --command bash -c "yarn lint:py"

# Format
nix develop --command bash -c "yarn format:py"

# Type check
nix develop .#python --command bash -c "poetry run basedpyright"

# Build a Python library
nix develop .#python --command bash -c "cd libs/sdk-python && poetry build"
```

### Cross-language (use default shell)

```bash
# Full monorepo build
nix develop --command bash -c "yarn install && yarn build"

# Full lint (all languages)
nix develop --command bash -c "yarn lint"

# Full format (all languages)
nix develop --command bash -c "yarn format"

# Generate all API clients
nix develop --command bash -c "yarn generate:api-client"
```

## Monorepo Orchestration

This project uses **Nx** as its monorepo orchestrator. Key commands:

```bash
# See the project dependency graph
npx nx graph

# Run a target for a specific project
npx nx <target> <project>

# Run a target for all projects
npx nx run-many --target=<target> --all

# Run only affected projects (based on git changes)
npx nx affected --target=<target>
```

Available Nx targets: `build`, `test`, `lint`, `serve`, `format`, `docker`, `docs`, `tidy`, `generate:api-client`

## Environment Variables

These are set automatically by the Nix shell hooks:

| Variable | Value | Shell(s) |
|---|---|---|
| `GOPATH` | `$HOME/go` | go, default |
| `GOBIN` | `$GOPATH/bin` | go, default |
| `NX_DAEMON` | `true` | node, default |
| `NODE_ENV` | `development` | node, default |
| `COREPACK_ENABLE_DOWNLOAD_PROMPT` | `0` | node, default |
| `POETRY_VIRTUALENVS_IN_PROJECT` | `true` | python, default |

## Supporting Services

The Nix shells provide **build tools only**. Runtime services (PostgreSQL, Redis, etc.) are still managed via Docker Compose:

```bash
docker compose -f .devcontainer/docker-compose.yaml up -d postgres redis
```

See `.devcontainer/docker-compose.yaml` for the full list of available services.

## Troubleshooting

### `yarn: command not found`

Yarn 4.x is provided via a corepack wrapper in the Nix shell. Make sure you entered the `node` or `default` shell. If the issue persists:

```bash
corepack enable --install-directory ~/.local/bin
export PATH="$HOME/.local/bin:$PATH"
```

### Go tools (swag, gow, gomarkdoc) not found

These are installed on first shell entry via `go install`. If they fail, install manually:

```bash
go install github.com/swaggo/swag/cmd/swag@v1.16.4
go install github.com/mitranim/gow@latest
go install github.com/princjef/gomarkdoc/cmd/gomarkdoc@v1.1.0
```

### Nix flake not evaluating

```bash
# Check flake syntax
nix flake check

# Update inputs (if packages are missing)
nix flake update
```

### direnv not activating

```bash
# Allow the .envrc
direnv allow

# Verify nix-direnv is installed
nix-env -q nix-direnv
```

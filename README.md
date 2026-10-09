# TemplateSlim — Slim SaaS Monorepo Template (node + python + go)

A minimal, production-wired monorepo for new SaaS projects. Put your backend in
`apps/api`, your frontend in `apps/web`, and ship with the same CI / e2e /
release / devcontainer pipeline on day one.

Slimmed down from a sandbox-platform monorepo: only **Node.js 22 + Python 3.12
+ Go 1.25** remain. No Ruby, no Java, no sandbox runtime.

## Start a new project

```bash
node scripts/init.mjs --name acme --org acme-org
```

This renames every placeholder (`template-slim`, `template-org`,
`template_slim`, …), refreshes the lockfiles, and verifies
`go work sync` + `yarn install` + `nx show projects`.

## Five steps to green

```bash
yarn install
npx nx serve api                  # NestJS API on :3001 (needs db + redis, see below)
npx nx serve web                  # Next.js frontend on :3000
yarn test                         # unit tests, all projects
yarn test:e2e                      # Playwright smoke (apps/e2e, needs api + web running)
yarn docker:production            # images for api/web/worker
```

Local stateful deps (Postgres + Redis + dex OIDC + registry):

```bash
docker compose -f .devcontainer/docker-compose.yaml up -d
```

Or open the whole repo in the devcontainer (`Remote-Containers: Reopen in
Container`) — Node/Go/Python toolchains come preinstalled.

## Layout

```
apps/
  api/            NestJS API (auth, users, orgs, audit, health + hello example)
  web/            Next.js 15 frontend (talks to the API, /health included)
  worker/         Minimal Go service (health + ticker skeleton)
  e2e/            Playwright smoke suite + e2e compose file
  docs/           Astro documentation site
libs/
  api-client/             TS client (generated from the API OpenAPI spec)
  sdk-typescript/         TS SDK skeleton
  api-client-python/      Python client (generated)
  sdk-python/             Python SDK skeleton
  api-client-go/          Go client (generated)
  sdk-go/                 Go SDK skeleton
  common-go/              Shared Go helpers
hack/             OpenAPI generator templates + postprocess scripts
scripts/init.mjs  Project initializer (see above)
```

API clients are generated, never hand-edited:

```bash
yarn generate:api-client   # NestJS OpenAPI -> TS + Python + Go clients
```

## CI / release

- PR: `pr_checks` (go-work, golangci, eslint, python lint, client regen check,
  SDK typecheck, test, build, license headers, yarnrc) + `e2e_pr_tests`
  (Playwright smoke on affected projects) + `pr_docker_build`.
- Release: `prepare-release` (PR) -> `release` (nx release + images + manifest)
  -> `sdk_publish` (npm/PyPI/Go).
- Secrets: see `GITHUB_ACTIONS_SECRETS.md` (only registry + package tokens).

## Conventions for new code

- Backend: copy `apps/api/src/hello/` for a new resource (public + secured
  route pattern). Entities auto-load; migrations live in
  `apps/api/src/migrations/` — never edit old ones.
- Frontend: `apps/web/src/lib/api-client.ts` resolves the API URL per runtime
  (`API_URL` server-side, `NEXT_PUBLIC_API_URL` in the browser).
- Go: copy `apps/worker/` for a new service (it already has
  `project.json` with build/test/lint/tidy/docker targets).
- SDKs: one method per API resource, backed by the generated client, with an
  offline unit test (`httptest` / `MockTransport` / jest mock).

## Appendix: need a Vite SPA instead of Next.js?

The template ships Next.js because that is the team default. To switch one
project to Vite: delete `apps/web`, run `npx nx g @nx/react:app
--directory=apps/web --name=web`, and re-add the `serve`/`typecheck`/`docker`
targets following `apps/web/project.json` in git history. Everything else
(CI, e2e, release) keys off target names, not frameworks.

## Known limitations (environment)

- Docker image builds (`yarn docker:production`) need registry access; they
  run in CI, not in sandboxed dev machines without it.
- `apps/docs` still contains upstream tutorial prose — replace with your own.

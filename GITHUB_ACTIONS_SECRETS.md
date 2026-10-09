# GitHub Actions Secrets

Secrets are optional unless noted. An unset secret only disables the steps
that need it — PR checks, unit tests, builds and the Playwright smoke test
run with `GITHUB_TOKEN` alone.

Set them at: repo **Settings → Secrets and variables → Actions → New
repository secret**.

| Secret | Used by | How to obtain |
|---|---|---|
| `GITHUB_TOKEN` | everything (checkout, release PRs) | auto-provided by GitHub, nothing to do |
| `DOCKER_TOKEN` | `release.yaml` (push `api`/`web`/`worker` images to Docker Hub) | Docker Hub → account **Settings → Personal access tokens → Generate** (Read, Write, Delete scopes) → paste the token. Docker Hub username comes from `github.repository_owner` automatically |
| `NPM_TOKEN` | `sdk_publish.yaml` (publish `@<org>/sdk`) | npmjs.com → **Access Tokens → Generate New Token → Classic**, type **Automation** |
| `PYPI_TOKEN` | `sdk_publish.yaml` (publish `template_slim` + client) | pypi.org → **Account settings → API tokens → Add API token** (scope the whole account or the two packages) |
| `GT_API_KEY` + `GT_PROJECT_ID` | `translate.yaml` (docs i18n via gtx-cli) | General Translation dashboard → project settings. Skip both if you don't translate docs |
| `NX_CLOUD_ACCESS_TOKEN` | Nx Cloud remote cache (all workflows) | nx.app → workspace **Settings → Access tokens**. Pure speed-up; safe to skip |

No Auth0/Algolia/object-storage secrets: the slim template has no sandbox
billing, search, or CLI distribution jobs.

## Minimal setup

1. Nothing — push to `main` and open a PR: `pr_checks`, `e2e_pr_tests` and
   `pr_docker_build` are fully green without any secret.
2. Add `DOCKER_TOKEN` when you cut the first release (`release.yaml` →
   `docker_build`).
3. Add `NPM_TOKEN` / `PYPI_TOKEN` when you publish SDKs (`sdk_publish.yaml`).

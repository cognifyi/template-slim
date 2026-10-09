# GitHub Actions Secrets

Repository secrets required by the slim template workflows. All are optional
except `GITHUB_TOKEN` (provided automatically) — unset secrets only disable
the steps that need them.

| Secret | Used by | Required? |
|---|---|---|
| `GITHUB_TOKEN` | all (checkout, release PRs) | auto-provided |
| `DOCKER_TOKEN` | `release.yaml` docker login, `pr_docker_build.yaml` | only for image publish |
| `NPM_TOKEN` | `sdk_publish.yaml` (npm publish) | only for SDK publish |
| `PYPI_TOKEN` | `sdk_publish.yaml` (poetry publish) | only for SDK publish |
| `NX_CLOUD_ACCESS_TOKEN` | Nx Cloud caching (all workflows) | no, caching only |

No Auth0/Algolia/object-storage secrets: the slim template has no
sandbox billing, search, or CLI distribution jobs.

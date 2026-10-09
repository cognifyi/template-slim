# TemplateSlim Python SDK (skeleton)

Example Python SDK for template-slim. Copy this package to start a typed
client for your own API.

## Quick Start

```python
from template_slim import Client, ClientConfig

with Client(ClientConfig(api_url="http://localhost:3001", api_key="your-api-key")) as client:
    print(client.health())
```

## Extending

Add one module per API resource next to `template_slim/client.py`, backed by
`template_slim_api_client` (generated from the NestJS OpenAPI spec via
`yarn generate:api-client`). Keep every method covered by an offline pytest —
see `tests/test_client.py`.

# TemplateSlim Go SDK (skeleton)

Example Go SDK for template-slim. Copy this library to start a typed client for
your own API.

## Quick Start

```go
package main

import (
	"context"
	"log"

	sdk "github.com/template-org/template-slim/libs/sdk-go"
)

func main() {
	client, err := sdk.NewClient(sdk.Config{
		APIURL: "http://localhost:3001",
		APIKey: "your-api-key",
	})
	if err != nil {
		log.Fatal(err)
	}

	health, err := client.Health(context.Background())
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("API status: %s (SDK %s)", health.Status, sdk.Version)
}
```

## Extending

Add one method per API resource next to `client.go`, backed by
`libs/api-client-go` (generated from the NestJS OpenAPI spec via
`yarn generate:api-client`). Keep every method covered by an offline
`httptest` unit test — see `client_test.go`.

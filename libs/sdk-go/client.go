// Copyright 2025 TemplateOrg.
// SPDX-License-Identifier: Apache-2.0

// Package sdk is the template-slim example Go SDK.
//
// It demonstrates the SDK skeleton every new project copies: a Config, a
// Client constructed with NewClient, and one method per API resource.
// Extend it with typed methods backed by libs/api-client-go (generated from
// the NestJS OpenAPI spec via `yarn generate:api-client`).
package sdk

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// Version is the SDK version. Release automation overwrites VERSION alongside
// releases; keep them in sync when cutting a new version.
const Version = "0.0.0-dev"

// Config configures a Client.
type Config struct {
	// APIURL is the base URL of the API, e.g. http://localhost:3001.
	APIURL string
	// APIKey is sent as a Bearer token. Optional for public endpoints.
	APIKey string
	// HTTPClient overrides the default client (10s timeout). Useful in tests.
	HTTPClient *http.Client
}

// Client talks to the template-slim API.
type Client struct {
	baseURL string
	apiKey  string
	http    *http.Client
}

// NewClient validates cfg and returns a Client.
func NewClient(cfg Config) (*Client, error) {
	if strings.TrimSpace(cfg.APIURL) == "" {
		return nil, fmt.Errorf("sdk: Config.APIURL is required")
	}
	httpClient := cfg.HTTPClient
	if httpClient == nil {
		httpClient = &http.Client{Timeout: 10 * time.Second}
	}
	return &Client{
		baseURL: strings.TrimSuffix(cfg.APIURL, "/"),
		apiKey:  cfg.APIKey,
		http:    httpClient,
	}, nil
}

// HealthResponse is the GET /api/health payload.
type HealthResponse struct {
	Status string `json:"status"`
}

// Health calls GET /api/health and returns the decoded payload.
func (c *Client) Health(ctx context.Context) (*HealthResponse, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+"/api/health", nil)
	if err != nil {
		return nil, fmt.Errorf("sdk: build health request: %w", err)
	}
	if c.apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.apiKey)
	}
	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("sdk: health request failed: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("sdk: health returned status %d", resp.StatusCode)
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("sdk: read health response: %w", err)
	}
	var out HealthResponse
	if err := json.Unmarshal(body, &out); err != nil {
		return nil, fmt.Errorf("sdk: decode health response: %w", err)
	}
	return &out, nil
}

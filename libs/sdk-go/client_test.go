// Copyright 2025 TemplateOrg.
// SPDX-License-Identifier: Apache-2.0

package sdk

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestNewClientRequiresAPIURL(t *testing.T) {
	if _, err := NewClient(Config{}); err == nil {
		t.Fatal("expected error for empty APIURL")
	}
}

func TestHealth(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/health" {
			t.Errorf("unexpected path %s", r.URL.Path)
		}
		if got := r.Header.Get("Authorization"); got != "Bearer test-key" {
			t.Errorf("unexpected auth header %q", got)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	}))
	defer server.Close()

	client, err := NewClient(Config{APIURL: server.URL, APIKey: "test-key"})
	if err != nil {
		t.Fatal(err)
	}
	out, err := client.Health(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if out.Status != "ok" {
		t.Fatalf("expected ok, got %q", out.Status)
	}
}

func TestHealthNonOK(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	defer server.Close()

	client, err := NewClient(Config{APIURL: server.URL})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := client.Health(context.Background()); err == nil {
		t.Fatal("expected error for 503")
	}
}

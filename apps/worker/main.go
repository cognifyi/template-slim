// Copyright 2025 TemplateOrg.
// SPDX-License-Identifier: Apache-2.0

// Package main implements the template-slim example background worker.
//
// Copy this app to start a new Go service. It exposes a /health endpoint and
// runs a placeholder ticker loop — replace tick() with real work.
package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"ok","service":"worker"}`))
	})

	server := &http.Server{
		Addr:              addr(),
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go tick(ctx)

	slog.Info("worker listening", "addr", server.Addr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		slog.Error("worker server error", "err", err)
		os.Exit(1)
	}
}

// tick is a placeholder for periodic background work. Replace with real jobs.
func tick(ctx context.Context) {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case t := <-ticker.C:
			slog.Debug("worker tick", "at", t)
		}
	}
}

func addr() string {
	if port := os.Getenv("PORT"); port != "" {
		return ":" + port
	}
	return ":8080"
}

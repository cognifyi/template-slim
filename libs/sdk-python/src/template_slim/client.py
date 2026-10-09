# Copyright 2025 TemplateOrg.
# SPDX-License-Identifier: Apache-2.0
"""Minimal API client skeleton."""

from dataclasses import dataclass
from typing import Optional

import httpx


@dataclass
class ClientConfig:
    """Configuration for :class:`Client`."""

    api_url: str
    api_key: str = ""


@dataclass
class HealthResponse:
    """GET /api/health payload."""

    status: str


class Client:
    """Thin wrapper over the template-slim API."""

    _base_url: str
    _http: httpx.Client

    def __init__(self, config: ClientConfig, transport: Optional[httpx.BaseTransport] = None) -> None:
        if not config.api_url or not config.api_url.strip():
            raise ValueError("api_url is required")
        self._base_url = config.api_url.rstrip("/")
        headers = {"Authorization": f"Bearer {config.api_key}"} if config.api_key else {}
        self._http = httpx.Client(base_url=self._base_url, headers=headers, timeout=10.0, transport=transport)

    def health(self) -> HealthResponse:
        """Call GET /api/health and return the decoded payload."""
        response = self._http.get("/api/health")
        _ = response.raise_for_status()
        return HealthResponse(status=response.json()["status"])

    def close(self) -> None:
        """Close the underlying HTTP connection pool."""
        self._http.close()

    def __enter__(self) -> "Client":
        return self

    def __exit__(self, *exc_info: object) -> None:
        self.close()

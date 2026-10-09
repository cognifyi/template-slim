# Copyright 2025 TemplateOrg.
# SPDX-License-Identifier: Apache-2.0
"""Offline unit tests for the SDK skeleton (no server required)."""

import httpx
import pytest

from template_slim.client import Client, ClientConfig


def make_client(handler: httpx.MockTransport.Handler) -> Client:
    transport = httpx.MockTransport(handler)
    return Client(ClientConfig(api_url="http://testserver", api_key="test-key"), transport=transport)


def test_requires_api_url() -> None:
    with pytest.raises(ValueError):
        Client(ClientConfig(api_url="  "))


def test_health_ok() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/api/health"
        assert request.headers["Authorization"] == "Bearer test-key"
        return httpx.Response(200, json={"status": "ok"})

    assert make_client(handler).health().status == "ok"


def test_health_non_ok_raises() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(503, json={"status": "error"})

    with pytest.raises(httpx.HTTPStatusError):
        make_client(handler).health()

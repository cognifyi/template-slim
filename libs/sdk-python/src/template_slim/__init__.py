# Copyright 2025 TemplateOrg.
# SPDX-License-Identifier: Apache-2.0
"""Example Python SDK for template-slim.

Copy this package to start a typed client for your own API. Add one module
per API resource next to :mod:`template_slim.client`, backed by
``template_slim_api_client`` (generated from the NestJS OpenAPI spec via
``yarn generate:api-client``).
"""

from template_slim.client import Client, ClientConfig, HealthResponse

__all__ = ["Client", "ClientConfig", "HealthResponse", "__version__"]

__version__ = "0.0.0.dev0"

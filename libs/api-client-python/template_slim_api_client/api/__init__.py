from __future__ import annotations

# flake8: noqa

# import apis into api package
import importlib
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from template_slim_api_client.api.health_api import HealthApi
    from template_slim_api_client.api.hello_api import HelloApi
    from template_slim_api_client.api.api_keys_api import ApiKeysApi
    from template_slim_api_client.api.audit_api import AuditApi
    from template_slim_api_client.api.config_api import ConfigApi
    from template_slim_api_client.api.organizations_api import OrganizationsApi
    from template_slim_api_client.api.users_api import UsersApi


_DYNAMIC_IMPORTS: dict[str, str] = {
    "HealthApi": "template_slim_api_client.api.health_api",
    "HelloApi": "template_slim_api_client.api.hello_api",
    "ApiKeysApi": "template_slim_api_client.api.api_keys_api",
    "AuditApi": "template_slim_api_client.api.audit_api",
    "ConfigApi": "template_slim_api_client.api.config_api",
    "OrganizationsApi": "template_slim_api_client.api.organizations_api",
    "UsersApi": "template_slim_api_client.api.users_api",

}


def __getattr__(attr_name: str) -> object:
    module_path = _DYNAMIC_IMPORTS.get(attr_name)
    if module_path is None:
        raise AttributeError(f"module {__name__!r} has no attribute {attr_name!r}")
    mod = importlib.import_module(module_path)
    value = getattr(mod, attr_name)
    globals()[attr_name] = value
    return value


def __dir__() -> list[str]:
    return list(_DYNAMIC_IMPORTS.keys())

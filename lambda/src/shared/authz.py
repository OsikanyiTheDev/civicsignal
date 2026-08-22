from __future__ import annotations

import json
from typing import Any


class AuthorizationError(PermissionError):
    """Raised when a JWT-authenticated request lacks a CivicSignal operational role."""


def jwt_claims(event: dict[str, Any]) -> dict[str, Any]:
    return ((event.get("requestContext") or {}).get("authorizer") or {}).get("jwt", {}).get("claims", {})


def groups_from_event(event: dict[str, Any]) -> set[str]:
    raw_groups = jwt_claims(event).get("cognito:groups", [])
    if isinstance(raw_groups, list):
        return {str(group) for group in raw_groups}
    if not raw_groups:
        return set()
    if isinstance(raw_groups, str):
        try:
            decoded = json.loads(raw_groups)
            if isinstance(decoded, list):
                return {str(group) for group in decoded}
        except json.JSONDecodeError:
            pass
        return {group.strip() for group in raw_groups.split(",") if group.strip()}
    return set()


def require_any_group(event: dict[str, Any], allowed_groups: set[str]) -> str:
    groups = groups_from_event(event)
    if not groups.intersection(allowed_groups):
        raise AuthorizationError("This action requires a CivicSignal operational role.")
    return str(jwt_claims(event).get("sub", ""))


def require_moderator(event: dict[str, Any]) -> str:
    return require_any_group(event, {"Moderator", "Administrator"})


def require_responder(event: dict[str, Any]) -> str:
    return require_any_group(event, {"Responder", "Moderator", "Administrator"})

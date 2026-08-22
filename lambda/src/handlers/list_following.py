from __future__ import annotations

from typing import Any

from shared.authz import AuthorizationError, require_authenticated
from shared.http import response
from shared.repository import list_followed_incidents, public_incident


def lambda_handler(event: dict[str, Any], _context: Any) -> dict[str, Any]:
    try:
        subject = require_authenticated(event)
    except AuthorizationError as error:
        return response(401, {"message": str(error)})

    incidents = [public_incident(item) for item in list_followed_incidents(subject)]
    return response(200, {"incidents": incidents, "count": len(incidents)})

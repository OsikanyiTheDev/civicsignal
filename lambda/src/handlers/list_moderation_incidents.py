from __future__ import annotations

from typing import Any

from shared.authz import AuthorizationError, require_moderator
from shared.http import response
from shared.moderation import moderation_incident
from shared.repository import list_incidents


def lambda_handler(event: dict[str, Any], _context: Any) -> dict[str, Any]:
    try:
        require_moderator(event)
    except AuthorizationError as error:
        return response(403, {"message": str(error)})

    incidents = [moderation_incident(item) for item in list_incidents()]
    return response(200, {"incidents": incidents, "count": len(incidents)})

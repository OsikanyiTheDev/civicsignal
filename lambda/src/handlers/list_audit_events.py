from __future__ import annotations

from typing import Any

from shared.authz import AuthorizationError, require_moderator
from shared.http import response
from shared.repository import list_audit_events


def lambda_handler(event: dict[str, Any], _context: Any) -> dict[str, Any]:
    try:
        require_moderator(event)
        incident_id = (event.get("pathParameters") or {}).get("id")
        if not incident_id:
            return response(400, {"message": "Incident id is required"})
        events = list_audit_events(incident_id)
        # Actor identifiers are intentionally omitted from the browser response.
        safe_events = [{key: value for key, value in item.items() if key not in {"PK", "SK", "actor_sub"}} for item in events]
        return response(200, {"events": safe_events})
    except AuthorizationError as error:
        return response(403, {"message": str(error)})

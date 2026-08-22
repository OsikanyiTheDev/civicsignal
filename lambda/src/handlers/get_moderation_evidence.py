from __future__ import annotations

from typing import Any

from shared.authz import AuthorizationError, require_moderator
from shared.evidence import create_private_download_url
from shared.http import response
from shared.moderation import require_evidence_key


def lambda_handler(event: dict[str, Any], _context: Any) -> dict[str, Any]:
    try:
        require_moderator(event)
        incident_id = (event.get("pathParameters") or {}).get("id")
        if not incident_id:
            return response(400, {"message": "Incident id is required"})
        incident, key = require_evidence_key(incident_id)
        return response(200, {
            "evidence_url": create_private_download_url(key),
            "evidence_status": incident.get("evidence_status", "Awaiting review"),
            "expires_in_seconds": 300,
        })
    except AuthorizationError as error:
        return response(403, {"message": str(error)})
    except LookupError as error:
        return response(404, {"message": str(error)})

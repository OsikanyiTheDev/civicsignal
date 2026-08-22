from __future__ import annotations

from typing import Any

from shared.evidence import create_private_download_url
from shared.http import response
from shared.moderation import require_evidence_key


def lambda_handler(event: dict[str, Any], _context: Any) -> dict[str, Any]:
    incident_id = (event.get("pathParameters") or {}).get("id")
    if not incident_id:
        return response(400, {"message": "Incident id is required"})

    try:
        incident, key = require_evidence_key(incident_id)
    except LookupError as error:
        return response(404, {"message": str(error)})

    if incident.get("evidence_status") != "Approved":
        return response(404, {"message": "No approved public photo is available for this incident"})

    return response(200, {"evidence_url": create_private_download_url(key), "expires_in_seconds": 300})

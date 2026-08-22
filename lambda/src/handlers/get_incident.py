from __future__ import annotations

from typing import Any

from shared.http import response
from shared.repository import get_incident, public_incident


def lambda_handler(event: dict[str, Any], _context: Any) -> dict[str, Any]:
    incident_id = (event.get("pathParameters") or {}).get("id")
    if not incident_id:
        return response(400, {"message": "Incident id is required"})

    incident = get_incident(incident_id)
    if not incident:
        return response(404, {"message": "Incident not found"})

    return response(200, {"incident": public_incident(incident)})

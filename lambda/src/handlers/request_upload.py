from __future__ import annotations

from typing import Any

from shared.evidence import create_private_upload_form
from shared.http import parse_json_body, response
from shared.repository import get_incident


def lambda_handler(event: dict[str, Any], _context: Any) -> dict[str, Any]:
    """Internal future route for trusted evidence operations.

    The public website uses the Cognito-protected report-with-evidence route.
    This route remains AWS_IAM protected for operational tooling.
    """
    try:
        payload = parse_json_body(event)
        incident_id = payload.get("incident_id")
        if not isinstance(incident_id, str) or not incident_id:
            return response(400, {"message": "incident_id is required"})
        if not get_incident(incident_id):
            return response(404, {"message": "Incident not found"})
        key, post = create_private_upload_form(incident_id, payload.get("content_type"))
        return response(200, {"upload": post, "object_key": key, "expires_in_seconds": 300})
    except (ValueError, TypeError) as error:
        return response(400, {"message": str(error)})

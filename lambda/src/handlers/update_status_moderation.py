from __future__ import annotations

from typing import Any

from botocore.exceptions import ClientError

from shared.authz import AuthorizationError, require_responder
from shared.http import parse_json_body, response
from shared.repository import public_incident, update_incident_status, write_audit_event
from shared.validation import ValidationError, validate_status


def lambda_handler(event: dict[str, Any], _context: Any) -> dict[str, Any]:
    try:
        actor_sub = require_responder(event)
        incident_id = (event.get("pathParameters") or {}).get("id")
        if not incident_id:
            return response(400, {"message": "Incident id is required"})
        payload = parse_json_body(event)
        status = validate_status(payload)
        note = str(payload.get("note") or "Status updated by CivicSignal responder").strip()[:300]
        incident = update_incident_status(incident_id, status, note)
        write_audit_event(incident_id, actor_sub, f"Status changed to {status}", note)
        return response(200, {"incident": public_incident(incident)})
    except AuthorizationError as error:
        return response(403, {"message": str(error)})
    except (ValidationError, ValueError) as error:
        return response(400, {"message": str(error)})
    except ClientError as error:
        if error.response.get("Error", {}).get("Code") == "ConditionalCheckFailedException":
            return response(404, {"message": "Incident not found"})
        return response(500, {"message": "Unable to update incident status"})

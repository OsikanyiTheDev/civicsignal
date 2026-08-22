from __future__ import annotations

from typing import Any

from botocore.exceptions import ClientError

from shared.http import parse_json_body, response
from shared.repository import public_incident, update_incident_status
from shared.validation import ValidationError, validate_status


def lambda_handler(event: dict[str, Any], _context: Any) -> dict[str, Any]:
    incident_id = (event.get("pathParameters") or {}).get("id")
    if not incident_id:
        return response(400, {"message": "Incident id is required"})

    try:
        status = validate_status(parse_json_body(event))
        incident = update_incident_status(incident_id, status)
    except (ValidationError, ValueError) as error:
        return response(400, {"message": str(error)})
    except ClientError as error:
        if error.response.get("Error", {}).get("Code") == "ConditionalCheckFailedException":
            return response(404, {"message": "Incident not found"})
        return response(500, {"message": "Unable to update incident status"})

    return response(200, {"incident": public_incident(incident)})

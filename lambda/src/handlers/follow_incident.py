from __future__ import annotations

from typing import Any

from botocore.exceptions import ClientError

from shared.authz import AuthorizationError, require_authenticated
from shared.http import response
from shared.repository import add_relationship, public_incident


def lambda_handler(event: dict[str, Any], _context: Any) -> dict[str, Any]:
    try:
        subject = require_authenticated(event)
        incident_id = (event.get("pathParameters") or {}).get("id")
        if not incident_id:
            return response(400, {"message": "Incident id is required"})
        incident = add_relationship(incident_id, subject, "following")
        return response(200, {"incident": public_incident(incident), "message": "You are now following this issue."})
    except AuthorizationError as error:
        return response(401, {"message": str(error)})
    except ClientError as error:
        code = error.response.get("Error", {}).get("Code")
        if code == "ConditionalCheckFailedException":
            return response(409, {"message": "You are already following this issue."})
        return response(404, {"message": "Unable to follow this issue."})

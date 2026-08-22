from __future__ import annotations

from typing import Any

from botocore.exceptions import ClientError

from shared.authz import AuthorizationError, require_moderator
from shared.http import parse_json_body, response
from shared.moderation import moderation_incident, review_evidence, safe_client_error
from shared.repository import write_audit_event


def lambda_handler(event: dict[str, Any], _context: Any) -> dict[str, Any]:
    try:
        actor_sub = require_moderator(event)
        incident_id = (event.get("pathParameters") or {}).get("id")
        if not incident_id:
            return response(400, {"message": "Incident id is required"})
        payload = parse_json_body(event)
        decision = payload.get("decision")
        note = str(payload.get("note") or "Evidence reviewed").strip()[:300]
        incident = review_evidence(incident_id, decision, note)
        write_audit_event(incident_id, actor_sub, f"Evidence {decision}", note)
        return response(200, {"incident": moderation_incident(incident)})
    except AuthorizationError as error:
        return response(403, {"message": str(error)})
    except (ValueError, TypeError) as error:
        return response(400, {"message": str(error)})
    except ClientError as error:
        return response(404, {"message": safe_client_error(error)})

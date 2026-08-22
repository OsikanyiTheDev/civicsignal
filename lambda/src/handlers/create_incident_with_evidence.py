from __future__ import annotations

import json
import os
import uuid
from typing import Any

import boto3
from botocore.exceptions import ClientError

from shared.evidence import create_private_upload_form
from shared.http import parse_json_body, response
from shared.repository import public_incident, put_incident, utc_now
from shared.validation import ValidationError, validate_incident_payload

EVENT_BUS_NAME = os.environ["EVENT_BUS_NAME"]
_eventbridge = boto3.client("events")


def reporter_subject(event: dict[str, Any]) -> str | None:
    claims = ((event.get("requestContext") or {}).get("authorizer") or {}).get("jwt", {}).get("claims", {})
    return claims.get("sub")


def lambda_handler(event: dict[str, Any], _context: Any) -> dict[str, Any]:
    subject = reporter_subject(event)
    if not subject:
        return response(401, {"message": "A verified sign-in is required for photo evidence."})

    try:
        raw_payload = parse_json_body(event)
        evidence_content_type = raw_payload.get("evidence_content_type")
        payload = validate_incident_payload(raw_payload)
        incident_id = str(uuid.uuid4())
        evidence_key, upload_form = create_private_upload_form(incident_id, evidence_content_type)
    except (ValidationError, ValueError) as error:
        return response(400, {"message": str(error)})

    now = utc_now()
    incident = {
        "PK": f"INCIDENT#{incident_id}",
        "SK": "METADATA",
        "id": incident_id,
        "title": payload["title"],
        "area": payload["area"],
        "summary": payload["summary"],
        "category": payload["category"],
        "urgency": payload["urgency"],
        "status": "Submitted",
        "updates": 1,
        "created_at": now,
        "updated_at": now,
        "GSI1PK": "STATUS#Submitted",
        "GSI1SK": f"{now}#{incident_id}",
        "reporter_sub": subject,
        "evidence_key": evidence_key,
        "evidence_status": "Awaiting private upload",
        "location_precision": payload["location_precision"],
        "status_history": [
            {"status": "Submitted", "at": now, "note": "Report received with private evidence"},
        ],
    }
    if payload["location_precision"] == "approximate":
        incident["public_latitude"] = payload["public_latitude"]
        incident["public_longitude"] = payload["public_longitude"]

    try:
        put_incident(incident)
        _eventbridge.put_events(
            Entries=[
                {
                    "Source": "civicsignal.incidents",
                    "DetailType": "IncidentSubmittedWithEvidence",
                    "EventBusName": EVENT_BUS_NAME,
                    "Detail": json.dumps({"id": incident_id, "category": incident["category"], "urgency": incident["urgency"], "area": incident["area"], "has_private_evidence": True}),
                }
            ]
        )
    except ClientError:
        return response(500, {"message": "Unable to record the report. Please try again later."})

    return response(201, {
        "incident": public_incident(incident),
        "evidence_upload": upload_form,
        "message": "Report received. Upload the selected photo within five minutes for private review.",
    })

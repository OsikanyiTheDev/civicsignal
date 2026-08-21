from __future__ import annotations

import json
import os
import uuid
from typing import Any

import boto3
from botocore.exceptions import ClientError

from shared.http import parse_json_body, response
from shared.repository import put_incident, utc_now
from shared.validation import ValidationError, validate_incident_payload

EVENT_BUS_NAME = os.environ["EVENT_BUS_NAME"]
_eventbridge = boto3.client("events")


def lambda_handler(event: dict[str, Any], _context: Any) -> dict[str, Any]:
    try:
        payload = validate_incident_payload(parse_json_body(event))
    except (ValidationError, ValueError) as error:
        return response(400, {"message": str(error)})

    incident_id = str(uuid.uuid4())
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
    }

    try:
        put_incident(incident)
        _eventbridge.put_events(
            Entries=[
                {
                    "Source": "civicsignal.incidents",
                    "DetailType": "IncidentSubmitted",
                    "EventBusName": EVENT_BUS_NAME,
                    "Detail": json.dumps({"id": incident_id, "category": incident["category"], "urgency": incident["urgency"], "area": incident["area"]}),
                }
            ]
        )
    except ClientError:
        return response(500, {"message": "Unable to record the report. Please try again later."})

    public_incident = {key: value for key, value in incident.items() if not key.startswith(("PK", "SK", "GSI"))}
    return response(201, {"incident": public_incident, "message": "Signal received and queued for verification."})

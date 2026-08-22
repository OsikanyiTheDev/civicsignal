from __future__ import annotations

from typing import Any

from botocore.exceptions import ClientError

from shared.repository import get_incident, utc_now, _table


def moderation_incident(item: dict[str, Any]) -> dict[str, Any]:
    """Return operational metadata without exposing the reporter subject."""
    hidden = {"PK", "SK", "GSI1PK", "GSI1SK", "reporter_sub"}
    return {key: value for key, value in item.items() if key not in hidden}


def review_evidence(incident_id: str, decision: str, note: str) -> dict[str, Any]:
    if decision not in {"Approved", "Rejected"}:
        raise ValueError("Evidence decision must be Approved or Rejected")

    now = utc_now()
    result = _table.update_item(
        Key={"PK": f"INCIDENT#{incident_id}", "SK": "METADATA"},
        UpdateExpression="SET evidence_status = :decision, evidence_review_note = :note, evidence_reviewed_at = :reviewed_at, updates = if_not_exists(updates, :zero) + :one, status_history = list_append(if_not_exists(status_history, :empty_history), :history_event)",
        ExpressionAttributeValues={
            ":decision": decision,
            ":note": note,
            ":reviewed_at": now,
            ":zero": 0,
            ":one": 1,
            ":empty_history": [],
            ":history_event": [{"status": "Verified", "at": now, "note": f"Private photo evidence {decision.lower()}"}],
        },
        ConditionExpression="attribute_exists(PK) AND attribute_exists(evidence_key)",
        ReturnValues="ALL_NEW",
    )
    return result["Attributes"]


def require_evidence_key(incident_id: str) -> tuple[dict[str, Any], str]:
    incident = get_incident(incident_id)
    if not incident:
        raise LookupError("Incident not found")
    key = incident.get("evidence_key")
    if not key:
        raise LookupError("No private evidence is attached to this incident")
    return incident, str(key)


def safe_client_error(error: ClientError) -> str:
    if error.response.get("Error", {}).get("Code") == "ConditionalCheckFailedException":
        return "The requested evidence could not be found"
    return "Unable to update the evidence review"

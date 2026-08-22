from __future__ import annotations

import os
from datetime import UTC, datetime
from typing import Any

import boto3

TABLE_NAME = os.environ["INCIDENTS_TABLE"]
_table = boto3.resource("dynamodb").Table(TABLE_NAME)


def utc_now() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat()


def incident_key(incident_id: str) -> dict[str, str]:
    return {"PK": f"INCIDENT#{incident_id}", "SK": "METADATA"}


PRIVATE_INCIDENT_FIELDS = {"PK", "SK", "GSI1PK", "GSI1SK", "reporter_sub", "evidence_key", "evidence_status"}


def public_incident(item: dict[str, Any]) -> dict[str, Any]:
    """Remove storage and reporter identity fields before public API responses."""
    return {key: value for key, value in item.items() if key not in PRIVATE_INCIDENT_FIELDS}


def put_incident(item: dict[str, Any]) -> None:
    _table.put_item(Item=item, ConditionExpression="attribute_not_exists(PK)")


def get_incident(incident_id: str) -> dict[str, Any] | None:
    result = _table.get_item(Key=incident_key(incident_id))
    return result.get("Item")


def list_incidents(limit: int = 50) -> list[dict[str, Any]]:
    """Return a bounded public board. Production pagination is a follow-on task."""
    result = _table.scan(Limit=limit)
    items = result.get("Items", [])
    return sorted(items, key=lambda item: item.get("updated_at", ""), reverse=True)


def update_incident_status(incident_id: str, status: str) -> dict[str, Any]:
    now = utc_now()
    result = _table.update_item(
        Key=incident_key(incident_id),
        UpdateExpression="SET #status = :status, GSI1PK = :gsi1pk, GSI1SK = :gsi1sk, updated_at = :updated_at, updates = if_not_exists(updates, :zero) + :one",
        ExpressionAttributeNames={"#status": "status"},
        ExpressionAttributeValues={
            ":status": status,
            ":gsi1pk": f"STATUS#{status}",
            ":gsi1sk": f"{now}#{incident_id}",
            ":updated_at": now,
            ":zero": 0,
            ":one": 1,
        },
        ConditionExpression="attribute_exists(PK)",
        ReturnValues="ALL_NEW",
    )
    return result["Attributes"]

from __future__ import annotations

import os
from datetime import UTC, datetime
from typing import Any

import boto3
from boto3.dynamodb.conditions import Attr, Key

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
    """Return a bounded public board without user-follow or confirmation records."""
    result = _table.scan(
        Limit=limit,
        FilterExpression=Attr("SK").eq("METADATA"),
    )
    items = result.get("Items", [])
    return sorted(items, key=lambda item: item.get("updated_at", ""), reverse=True)


def add_relationship(incident_id: str, subject: str, relationship: str) -> dict[str, Any]:
    """Create one user-to-incident relationship and increment the public counter.

    A conditional item prevents a signed-in person from confirming or following
    the same report repeatedly.
    """
    if relationship not in {"confirmation", "following"}:
        raise ValueError("Unsupported relationship")

    now = utc_now()
    if relationship == "confirmation":
        relationship_item = {
            "PK": f"INCIDENT#{incident_id}",
            "SK": f"CONFIRM#{subject}",
            "incident_id": incident_id,
            "subject": subject,
            "created_at": now,
        }
        counter = "confirmations"
    else:
        relationship_item = {
            "PK": f"USER#{subject}",
            "SK": f"FOLLOW#{incident_id}",
            "incident_id": incident_id,
            "created_at": now,
        }
        counter = "followers"

    _table.put_item(Item=relationship_item, ConditionExpression="attribute_not_exists(PK) AND attribute_not_exists(SK)")
    result = _table.update_item(
        Key=incident_key(incident_id),
        UpdateExpression="SET #counter = if_not_exists(#counter, :zero) + :one, updates = if_not_exists(updates, :zero) + :one",
        ExpressionAttributeNames={"#counter": counter},
        ExpressionAttributeValues={":zero": 0, ":one": 1},
        ConditionExpression="attribute_exists(PK)",
        ReturnValues="ALL_NEW",
    )
    return result["Attributes"]


def list_followed_incidents(subject: str) -> list[dict[str, Any]]:
    relationships = _table.query(KeyConditionExpression=Key("PK").eq(f"USER#{subject}")).get("Items", [])
    incidents: list[dict[str, Any]] = []
    for relationship in relationships:
        incident = get_incident(str(relationship["incident_id"]))
        if incident:
            incidents.append(incident)
    return sorted(incidents, key=lambda item: item.get("updated_at", ""), reverse=True)


def community_insights() -> dict[str, Any]:
    incidents = list_incidents(limit=100)
    by_category: dict[str, int] = {}
    by_status: dict[str, int] = {}
    by_area: dict[str, int] = {}
    for incident in incidents:
        by_category[incident["category"]] = by_category.get(incident["category"], 0) + 1
        by_status[incident["status"]] = by_status.get(incident["status"], 0) + 1
        by_area[incident["area"]] = by_area.get(incident["area"], 0) + 1

    return {
        "total_reports": len(incidents),
        "by_category": by_category,
        "by_status": by_status,
        "top_areas": sorted(
            [{"area": area, "count": count} for area, count in by_area.items()],
            key=lambda item: item["count"],
            reverse=True,
        )[:5],
    }


def update_incident_status(incident_id: str, status: str, note: str = "Status updated") -> dict[str, Any]:
    now = utc_now()
    result = _table.update_item(
        Key=incident_key(incident_id),
        UpdateExpression="SET #status = :status, GSI1PK = :gsi1pk, GSI1SK = :gsi1sk, updated_at = :updated_at, updates = if_not_exists(updates, :zero) + :one, status_history = list_append(if_not_exists(status_history, :empty_history), :history_event)",
        ExpressionAttributeNames={"#status": "status"},
        ExpressionAttributeValues={
            ":status": status,
            ":gsi1pk": f"STATUS#{status}",
            ":gsi1sk": f"{now}#{incident_id}",
            ":updated_at": now,
            ":zero": 0,
            ":one": 1,
            ":empty_history": [],
            ":history_event": [{"status": status, "at": now, "note": note}],
        },
        ConditionExpression="attribute_exists(PK)",
        ReturnValues="ALL_NEW",
    )
    return result["Attributes"]

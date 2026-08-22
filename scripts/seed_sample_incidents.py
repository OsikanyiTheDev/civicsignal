#!/usr/bin/env python3
"""Reset CivicSignal development data and load illustrative sample scenarios.

This script is deliberately destructive. It exists for the current development
stage before accepting real community reports. It requires an explicit
confirmation flag and should never be run against a production dataset with
real reports.
"""

from __future__ import annotations

import argparse
import mimetypes
import sys
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from pathlib import Path
from typing import Any

import boto3

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "sample-assets"
CONFIRMATION = "RESET_CIVICSIGNAL_DEVELOPMENT_DATA"

SAMPLES: list[dict[str, Any]] = [
    {
        "id": "sample-drainage-001",
        "title": "Blocked storm drain near a pedestrian crossing",
        "area": "Community Junction (sample)",
        "summary": "Illustrative scenario: rainwater is pooling near a crossing because leaves and refuse are blocking drainage flow.",
        "category": "Drainage",
        "urgency": "High",
        "status": "Verified",
        "updates": 2,
        "confirmations": 4,
        "followers": 2,
        "public_latitude": 5.603717,
        "public_longitude": -0.186964,
        "location_accuracy_meters": 12.0,
        "location_precision": "exact_public",
        "asset": "blocked-drainage-sample.jpg",
        "days_ago": 3,
    },
    {
        "id": "sample-streetlight-002",
        "title": "Streetlight outage along an evening pedestrian route",
        "area": "Market Lane (sample)",
        "summary": "Illustrative scenario: residents reported a dark section of a pedestrian route after several streetlights stopped working.",
        "category": "Streetlight",
        "urgency": "Medium",
        "status": "In progress",
        "updates": 3,
        "confirmations": 6,
        "followers": 5,
        "public_latitude": 5.614281,
        "public_longitude": -0.204515,
        "location_accuracy_meters": 15.0,
        "location_precision": "exact_public",
        "asset": "streetlight-outage-sample.jpg",
        "days_ago": 5,
    },
    {
        "id": "sample-waste-003",
        "title": "Overfilled community refuse collection point",
        "area": "Riverside Community (sample)",
        "summary": "Illustrative scenario: bagged refuse has accumulated at a shared collection point and needs review before the area becomes unsafe.",
        "category": "Waste",
        "urgency": "Medium",
        "status": "Submitted",
        "updates": 1,
        "confirmations": 3,
        "followers": 1,
        "public_latitude": 5.625114,
        "public_longitude": -0.215684,
        "location_accuracy_meters": 10.0,
        "location_precision": "exact_public",
        "asset": "waste-collection-sample.jpg",
        "days_ago": 1,
    },
    {
        "id": "sample-road-004",
        "title": "Faded road marking near a school-zone crossing",
        "area": "School Road (sample)",
        "summary": "Illustrative scenario: a crossing marking is difficult to see and has been added to the board for follow-up.",
        "category": "Road safety",
        "urgency": "Low",
        "status": "Verified",
        "updates": 2,
        "confirmations": 2,
        "followers": 1,
        "location_precision": "area_only",
        "days_ago": 7,
    },
    {
        "id": "sample-water-005",
        "title": "Intermittent access at a community water point",
        "area": "Northside Water Point (sample)",
        "summary": "Illustrative scenario: an intermittent public water-point issue was reported and later marked resolved after a community update.",
        "category": "Water",
        "urgency": "High",
        "status": "Resolved",
        "updates": 4,
        "confirmations": 5,
        "followers": 3,
        "location_precision": "area_only",
        "days_ago": 12,
    },
]


def timestamp(days_ago: int) -> str:
    return (datetime.now(UTC) - timedelta(days=days_ago)).replace(microsecond=0).isoformat()


def clear_development_data(table: Any) -> int:
    count = 0
    scan_kwargs: dict[str, Any] = {}
    while True:
        result = table.scan(**scan_kwargs)
        items = result.get("Items", [])
        with table.batch_writer() as batch:
            for item in items:
                batch.delete_item(Key={"PK": item["PK"], "SK": item["SK"]})
                count += 1
        if "LastEvaluatedKey" not in result:
            return count
        scan_kwargs["ExclusiveStartKey"] = result["LastEvaluatedKey"]


def put_sample(table: Any, s3: Any, bucket: str, sample: dict[str, Any]) -> None:
    created_at = timestamp(sample["days_ago"])
    incident = {
        "PK": f"INCIDENT#{sample['id']}",
        "SK": "METADATA",
        "id": sample["id"],
        "title": sample["title"],
        "area": sample["area"],
        "summary": sample["summary"],
        "category": sample["category"],
        "urgency": sample["urgency"],
        "status": sample["status"],
        "updates": sample["updates"],
        "confirmations": sample["confirmations"],
        "followers": sample["followers"],
        "created_at": created_at,
        "updated_at": created_at,
        "GSI1PK": f"STATUS#{sample['status']}",
        "GSI1SK": f"{created_at}#{sample['id']}",
        "location_precision": sample["location_precision"],
        "status_history": [
            {"status": "Submitted", "at": created_at, "note": "Illustrative sample report created"},
            {"status": sample["status"], "at": created_at, "note": "Illustrative sample status"},
        ],
        "sample_data": True,
        "sample_label": "Illustrative sample scenario",
    }

    if sample["location_precision"] == "exact_public":
        incident["public_latitude"] = Decimal(str(sample["public_latitude"]))
        incident["public_longitude"] = Decimal(str(sample["public_longitude"]))
        incident["location_accuracy_meters"] = Decimal(str(sample["location_accuracy_meters"]))

    asset_name = sample.get("asset")
    if asset_name:
        asset_path = ASSET_DIR / asset_name
        if not asset_path.exists():
            raise FileNotFoundError(f"Missing sample asset: {asset_path}")
        object_key = f"pending-evidence/{sample['id']}/illustrative-{asset_name}"
        content_type = mimetypes.guess_type(asset_path.name)[0] or "image/jpeg"
        s3.upload_file(str(asset_path), bucket, object_key, ExtraArgs={"ContentType": content_type})
        incident["evidence_key"] = object_key
        incident["evidence_status"] = "Approved"
        incident["evidence_review_note"] = "Illustrative sample image approved for the seeded development board"

    table.put_item(Item=incident)


def main() -> int:
    parser = argparse.ArgumentParser(description="Reset CivicSignal development data and seed illustrative sample scenarios.")
    parser.add_argument("--table", required=True, help="CivicSignal DynamoDB table name")
    parser.add_argument("--bucket", required=True, help="CivicSignal private evidence bucket name")
    parser.add_argument("--confirm", required=True, help=f"Type {CONFIRMATION} to allow deletion of current development records")
    args = parser.parse_args()

    if args.confirm != CONFIRMATION:
        print("Refusing to delete data: confirmation phrase did not match.", file=sys.stderr)
        return 2

    dynamodb = boto3.resource("dynamodb")
    s3 = boto3.client("s3")
    table = dynamodb.Table(args.table)

    deleted = clear_development_data(table)
    print(f"Deleted {deleted} development records.")

    for sample in SAMPLES:
        put_sample(table, s3, args.bucket, sample)
        print(f"Seeded {sample['id']} · {sample['title']}")

    print("Finished. All seeded records are marked as illustrative sample scenarios.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

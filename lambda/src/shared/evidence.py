from __future__ import annotations

import os
import uuid
from typing import Any

import boto3

EVIDENCE_BUCKET = os.environ["EVIDENCE_BUCKET"]
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
_s3 = boto3.client("s3")


def create_private_upload_form(incident_id: str, content_type: str) -> tuple[str, dict[str, Any]]:
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError("Unsupported photo type. Use JPG, PNG, or WebP.")

    key = f"pending-evidence/{incident_id}/{uuid.uuid4()}"
    post = _s3.generate_presigned_post(
        Bucket=EVIDENCE_BUCKET,
        Key=key,
        Fields={"Content-Type": content_type},
        Conditions=[
            {"Content-Type": content_type},
            ["content-length-range", 1, MAX_UPLOAD_BYTES],
        ],
        ExpiresIn=300,
    )
    return key, post

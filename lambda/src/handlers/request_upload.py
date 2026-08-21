from __future__ import annotations

import os
import uuid
from typing import Any

import boto3

from shared.http import parse_json_body, response

BUCKET_NAME = os.environ["EVIDENCE_BUCKET"]
_s3 = boto3.client("s3")
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024


def lambda_handler(event: dict[str, Any], _context: Any) -> dict[str, Any]:
    """Create a constrained, private S3 upload form for trusted workflow users.

    The Terraform route is AWS_IAM protected in the MVP. Public evidence uploads
    are intentionally deferred until a Cognito and moderation flow is enabled.
    """
    try:
        payload = parse_json_body(event)
        content_type = payload.get("content_type")
        if content_type not in ALLOWED_TYPES:
            return response(400, {"message": "Unsupported content type"})
        key = f"pending-evidence/{uuid.uuid4()}"
        post = _s3.generate_presigned_post(
            Bucket=BUCKET_NAME,
            Key=key,
            Fields={"Content-Type": content_type},
            Conditions=[
                {"Content-Type": content_type},
                ["content-length-range", 1, MAX_UPLOAD_BYTES],
            ],
            ExpiresIn=300,
        )
        return response(200, {"upload": post, "object_key": key, "expires_in_seconds": 300})
    except (ValueError, TypeError):
        return response(400, {"message": "A valid content_type is required"})

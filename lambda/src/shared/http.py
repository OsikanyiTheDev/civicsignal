import json
from decimal import Decimal
from typing import Any

ALLOWED_ORIGIN = "*"  # API Gateway CORS is the primary origin control for this MVP.


def json_default(value: Any) -> Any:
    """Serialize DynamoDB Decimal values as JSON numbers, not strings."""
    if isinstance(value, Decimal):
        return int(value) if value % 1 == 0 else float(value)
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")


def response(status_code: int, body: dict[str, Any]) -> dict[str, Any]:
    """Create an API Gateway HTTP API proxy response."""
    return {
        "statusCode": status_code,
        "headers": {
            "content-type": "application/json",
            "access-control-allow-origin": ALLOWED_ORIGIN,
            "access-control-allow-headers": "content-type,authorization",
            "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
        },
        "body": json.dumps(body, default=json_default),
    }


def parse_json_body(event: dict[str, Any]) -> dict[str, Any]:
    body = event.get("body") or "{}"
    if event.get("isBase64Encoded"):
        raise ValueError("Base64-encoded bodies are not supported for this route")
    parsed = json.loads(body)
    if not isinstance(parsed, dict):
        raise ValueError("Request body must be a JSON object")
    return parsed

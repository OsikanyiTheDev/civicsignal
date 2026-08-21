from __future__ import annotations

import re
from typing import Any

CATEGORIES = {"Water", "Drainage", "Waste", "Streetlight", "Road safety", "Other"}
URGENCY = {"Low", "Medium", "High"}
STATUSES = {"Submitted", "Verified", "In progress", "Resolved"}
CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f]")


class ValidationError(ValueError):
    """Raised when a public report does not meet CivicSignal API constraints."""


def clean_text(value: Any, field_name: str, minimum: int, maximum: int) -> str:
    if not isinstance(value, str):
        raise ValidationError(f"{field_name} must be text")
    cleaned = CONTROL_CHARS.sub("", value).strip()
    if not minimum <= len(cleaned) <= maximum:
        raise ValidationError(f"{field_name} must be between {minimum} and {maximum} characters")
    return cleaned


def validate_incident_payload(payload: dict[str, Any]) -> dict[str, str]:
    category = payload.get("category")
    urgency = payload.get("urgency", "Medium")
    if category not in CATEGORIES:
        raise ValidationError("category is not supported")
    if urgency not in URGENCY:
        raise ValidationError("urgency is not supported")

    return {
        "title": clean_text(payload.get("title"), "title", 8, 110),
        "area": clean_text(payload.get("area"), "area", 2, 80),
        "summary": clean_text(payload.get("summary"), "summary", 20, 600),
        "category": category,
        "urgency": urgency,
    }


def validate_status(payload: dict[str, Any]) -> str:
    status = payload.get("status")
    if status not in STATUSES:
        raise ValidationError("status is not supported")
    return status

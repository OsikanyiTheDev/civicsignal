from __future__ import annotations

import re
from typing import Any

CATEGORIES = {"Water", "Drainage", "Waste", "Streetlight", "Road safety", "Other"}
URGENCY = {"Low", "Medium", "High"}
STATUSES = {"Submitted", "Verified", "In progress", "Resolved"}
LOCATION_PRECISIONS = {"area_only", "approximate", "exact_public"}
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


def validate_public_location(payload: dict[str, Any]) -> dict[str, Any]:
    precision = payload.get("location_precision", "area_only")
    if precision not in LOCATION_PRECISIONS:
        raise ValidationError("location_precision is not supported")

    latitude = payload.get("latitude")
    longitude = payload.get("longitude")
    if latitude is None and longitude is None:
        return {"location_precision": "area_only"}
    if precision not in {"approximate", "exact_public"}:
        raise ValidationError("a public map precision must be selected when coordinates are provided")
    if isinstance(latitude, bool) or isinstance(longitude, bool) or not isinstance(latitude, (int, float)) or not isinstance(longitude, (int, float)):
        raise ValidationError("latitude and longitude must be numbers")
    if not -90 <= latitude <= 90 or not -180 <= longitude <= 180:
        raise ValidationError("location coordinates are out of range")

    if precision == "exact_public":
        if payload.get("exact_location_public_consent") is not True:
            raise ValidationError("exact_location_public_consent is required before sharing an exact public location")
        accuracy = payload.get("location_accuracy_meters")
        if accuracy is not None and (isinstance(accuracy, bool) or not isinstance(accuracy, (int, float)) or accuracy < 0 or accuracy > 100000):
            raise ValidationError("location_accuracy_meters is invalid")
        return {
            "location_precision": "exact_public",
            # Six decimal places retains useful navigation accuracy while
            # preventing needless full-precision browser GPS storage.
            "public_latitude": round(float(latitude), 6),
            "public_longitude": round(float(longitude), 6),
            "location_accuracy_meters": round(float(accuracy), 1) if accuracy is not None else None,
        }

    return {
        "location_precision": "approximate",
        "public_latitude": round(float(latitude), 2),
        "public_longitude": round(float(longitude), 2),
    }


def validate_incident_payload(payload: dict[str, Any]) -> dict[str, Any]:
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
        **validate_public_location(payload),
    }


def validate_status(payload: dict[str, Any]) -> str:
    status = payload.get("status")
    if status not in STATUSES:
        raise ValidationError("status is not supported")
    return status

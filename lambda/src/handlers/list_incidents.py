from __future__ import annotations

from typing import Any

from shared.http import response
from shared.repository import list_incidents, public_incident


def lambda_handler(_event: dict[str, Any], _context: Any) -> dict[str, Any]:
    items = list_incidents()
    incidents = [public_incident(item) for item in items]
    return response(200, {"incidents": incidents, "count": len(incidents)})

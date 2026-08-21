from __future__ import annotations

from typing import Any

from shared.http import response


def lambda_handler(_event: dict[str, Any], _context: Any) -> dict[str, Any]:
    return response(200, {"service": "civicsignal-api", "status": "healthy"})

from __future__ import annotations

from typing import Any

from shared.http import response
from shared.repository import community_insights


def lambda_handler(_event: dict[str, Any], _context: Any) -> dict[str, Any]:
    return response(200, {"insights": community_insights()})

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from decimal import Decimal

from shared.http import response
from shared.numbers import dynamodb_decimal
from shared.validation import ValidationError, validate_incident_payload, validate_status


class IncidentValidationTests(unittest.TestCase):
    def test_accepts_a_well_formed_public_report(self):
        result = validate_incident_payload(
            {
                "title": "Blocked drainage near crossing",
                "area": "Central ward",
                "summary": "Standing water is blocking a busy pedestrian crossing after rainfall.",
                "category": "Drainage",
                "urgency": "High",
            }
        )
        self.assertEqual(result["category"], "Drainage")
        self.assertEqual(result["urgency"], "High")

    def test_rejects_unknown_categories(self):
        with self.assertRaises(ValidationError):
            validate_incident_payload(
                {
                    "title": "Unknown category report",
                    "area": "Central ward",
                    "summary": "This report has enough detail but is in an unsupported category.",
                    "category": "Emergency",
                }
            )

    def test_rejects_short_descriptions(self):
        with self.assertRaises(ValidationError):
            validate_incident_payload(
                {
                    "title": "Blocked drainage near crossing",
                    "area": "Central ward",
                    "summary": "Too short",
                    "category": "Drainage",
                }
            )

    def test_rounds_approximate_location_before_storage(self):
        result = validate_incident_payload(
            {
                "title": "Blocked drainage near crossing",
                "area": "Central ward",
                "summary": "Standing water is blocking a busy pedestrian crossing after rainfall.",
                "category": "Drainage",
                "latitude": 5.6037168,
                "longitude": -0.1869644,
                "location_precision": "approximate",
            }
        )
        self.assertEqual(result["public_latitude"], 5.6)
        self.assertEqual(result["public_longitude"], -0.19)

    def test_rejects_coordinates_without_approximate_consent(self):
        with self.assertRaises(ValidationError):
            validate_incident_payload(
                {
                    "title": "Blocked drainage near crossing",
                    "area": "Central ward",
                    "summary": "Standing water is blocking a busy pedestrian crossing after rainfall.",
                    "category": "Drainage",
                    "latitude": 5.6,
                    "longitude": -0.19,
                    "location_precision": "area_only",
                }
            )

    def test_accepts_known_status(self):
        self.assertEqual(validate_status({"status": "In progress"}), "In progress")

    def test_rejects_unknown_status(self):
        with self.assertRaises(ValidationError):
            validate_status({"status": "Escalated"})

    def test_serializes_dynamodb_numbers_as_json_numbers(self):
        result = response(200, {"updates": Decimal("1")})
        self.assertEqual(result["body"], '{"updates": 1}')

    def test_converts_browser_location_float_to_dynamodb_decimal(self):
        self.assertEqual(dynamodb_decimal(5.6), Decimal("5.6"))


if __name__ == "__main__":
    unittest.main()

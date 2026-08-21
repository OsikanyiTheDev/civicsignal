import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

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

    def test_accepts_known_status(self):
        self.assertEqual(validate_status({"status": "In progress"}), "In progress")

    def test_rejects_unknown_status(self):
        with self.assertRaises(ValidationError):
            validate_status({"status": "Escalated"})


if __name__ == "__main__":
    unittest.main()

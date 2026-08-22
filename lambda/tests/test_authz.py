import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from shared.authz import groups_from_event, require_moderator


class AuthorizationGroupTests(unittest.TestCase):
    def test_parses_json_group_claim(self):
        event = {"requestContext": {"authorizer": {"jwt": {"claims": {"cognito:groups": '["Moderator"]'}}}}}
        self.assertEqual(groups_from_event(event), {"Moderator"})

    def test_parses_api_gateway_bracketed_group_claim(self):
        event = {"requestContext": {"authorizer": {"jwt": {"claims": {"cognito:groups": "[Moderator]", "sub": "test-user"}}}}}
        self.assertEqual(groups_from_event(event), {"Moderator"})
        self.assertEqual(require_moderator(event), "test-user")

    def test_rejects_non_moderator_group(self):
        event = {"requestContext": {"authorizer": {"jwt": {"claims": {"cognito:groups": "[Reporter]"}}}}}
        with self.assertRaises(PermissionError):
            require_moderator(event)


if __name__ == "__main__":
    unittest.main()

from django.test import TestCase


class LegacyCoreTestsSkipped(TestCase):
    def test_legacy_core_is_deprecated(self):
        self.skipTest("Legacy core tests are deprecated by backend/api rebuild.")

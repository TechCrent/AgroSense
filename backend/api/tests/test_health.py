from django.test import TestCase
from rest_framework.test import APIClient


class HealthTests(TestCase):
    def test_health(self):
        response = APIClient().get("/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content.decode("utf-8"), "ok")

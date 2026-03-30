from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient


class ConfirmTests(TestCase):
    @patch("api.services.orchestrator.get_diagnosis")
    @patch("api.services.orchestrator.assess_plant_health")
    def test_confirm_success(self, mock_health, mock_diag):
        mock_health.return_value = {
            "status": "healthy",
            "disease_name": None,
            "disease_type": None,
            "confidence": 0.9,
        }
        mock_diag.return_value = {
            "summary": "Plant appears healthy.",
            "steps": ["Keep leaves dry."],
            "language": "en",
        }
        image = SimpleUploadedFile("leaf.jpg", b"\xff\xd8\xff\xe0", content_type="image/jpeg")
        response = APIClient().post(
            "/api/confirm/",
            {"image": image, "plant_name": "Tomato", "language": "en"},
            format="multipart",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["plant"]["common_name"], "Tomato")
        self.assertEqual(response.data["version"], "v1")

    def test_confirm_requires_plant_name(self):
        image = SimpleUploadedFile("leaf.jpg", b"\xff\xd8\xff\xe0", content_type="image/jpeg")
        response = APIClient().post("/api/confirm/", {"image": image}, format="multipart")
        self.assertEqual(response.status_code, 400)

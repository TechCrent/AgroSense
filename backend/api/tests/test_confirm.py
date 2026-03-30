import base64
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
            {"images": image, "plant_name": "Tomato", "language": "en"},
            format="multipart",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["plant"]["common_name"], "Tomato")
        self.assertEqual(response.data["version"], "v1")

    def test_confirm_json_base64_request(self):
        # Note: We patch the underlying pipeline calls so this test doesn't hit external APIs.
        with patch("api.services.orchestrator.assess_plant_health") as mock_health_patched, patch(
            "api.services.orchestrator.get_diagnosis"
        ) as mock_diag_patched:
            mock_health_patched.return_value = {
                "status": "healthy",
                "disease_name": None,
                "disease_type": None,
                "confidence": 0.9,
            }
            mock_diag_patched.return_value = {
                "summary": "Plant appears healthy.",
                "steps": ["Keep leaves dry."],
                "language": "en",
            }

            b64 = base64.b64encode(b"\xff\xd8\xff\xe0").decode("ascii")
            data_url = f"data:image/jpg;base64,{b64}"
            response = APIClient().post(
                "/api/confirm/",
                {
                    "images": [data_url],
                    "plant_name": "Tomato",
                    "language": "en",
                    "scientific_name": "Solanum lycopersicum",
                    "plant_confidence": 0.94,
                },
                format="json",
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data["plant"]["common_name"], "Tomato")
            self.assertEqual(response.data["version"], "v1")

    def test_confirm_requires_plant_name(self):
        image = SimpleUploadedFile("leaf.jpg", b"\xff\xd8\xff\xe0", content_type="image/jpeg")
        response = APIClient().post("/api/confirm/", {"images": image}, format="multipart")
        self.assertEqual(response.status_code, 400)

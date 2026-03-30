from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient


class ScanTests(TestCase):
    @patch("api.services.orchestrator.identify_plant_candidates")
    def test_scan_success(self, mock_identify):
        mock_identify.return_value = [
            {
                "name": "Solanum lycopersicum",
                "common_name": "Tomato",
                "confidence": 0.94,
                "image_url": "https://example.com/t.jpg",
            }
        ]
        image = SimpleUploadedFile("leaf.jpg", b"\xff\xd8\xff\xe0", content_type="image/jpeg")
        response = APIClient().post("/api/scan/", {"image": image}, format="multipart")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["version"], "v1")
        self.assertEqual(len(response.data["candidates"]), 1)

    def test_scan_requires_image(self):
        response = APIClient().post("/api/scan/", {}, format="multipart")
        self.assertEqual(response.status_code, 400)

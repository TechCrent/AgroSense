import base64
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
        response = APIClient().post("/api/scan/", {"images": image}, format="multipart")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["version"], "v1")
        self.assertEqual(len(response.data["candidates"]), 1)

    def test_scan_json_base64_request(self):
        with patch("api.services.orchestrator.identify_plant_candidates") as mock_identify:
            mock_identify.return_value = [
                {
                    "name": "Solanum lycopersicum",
                    "common_name": "Tomato",
                    "confidence": 0.94,
                    "image_url": "https://example.com/t.jpg",
                }
            ]
            b64 = base64.b64encode(b"\xff\xd8\xff\xe0").decode("ascii")
            data_url = f"data:image/jpg;base64,{b64}"
            response = APIClient().post(
                "/api/scan/",
                {
                    "images": [data_url],
                    "latitude": 49.207,
                    "longitude": 16.608,
                    "similar_images": True,
                },
                format="json",
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data["version"], "v1")
            self.assertEqual(len(response.data["candidates"]), 1)

    def test_scan_requires_images(self):
        response = APIClient().post("/api/scan/", {}, format="multipart")
        self.assertEqual(response.status_code, 400)

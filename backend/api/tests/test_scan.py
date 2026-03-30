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

    @patch("api.services.orchestrator.identify_plant_candidates")
    def test_scan_returns_at_most_four_candidates_by_confidence(self, mock_identify):
        mock_identify.return_value = [
            {"name": "A", "common_name": "Low", "confidence": 0.1, "image_url": "https://x/a"},
            {"name": "B", "common_name": "Mid", "confidence": 0.5, "image_url": "https://x/b"},
            {"name": "C", "common_name": "Top", "confidence": 0.99, "image_url": "https://x/c"},
            {"name": "D", "common_name": "High", "confidence": 0.8, "image_url": "https://x/d"},
            {"name": "E", "common_name": "X", "confidence": 0.2, "image_url": "https://x/e"},
            {"name": "F", "common_name": "Y", "confidence": 0.3, "image_url": "https://x/f"},
        ]
        image = SimpleUploadedFile("leaf.jpg", b"\xff\xd8\xff\xe0", content_type="image/jpeg")
        response = APIClient().post("/api/scan/", {"images": image}, format="multipart")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["candidates"]), 4)
        names = [c["common_name"] for c in response.data["candidates"]]
        self.assertEqual(names, ["Top", "High", "Mid", "Y"])

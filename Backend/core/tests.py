from unittest.mock import MagicMock, patch

from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient


@override_settings(
    PLANT_API_URL='https://api.plant.id/v3',
    PLANT_DETECTION_API_KEY='test-plant-key',
)
class IdentifyPlantTests(TestCase):
    endpoint = '/identify-plant/'
    test_payload = {
        'images': [
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        ],
        'latitude': 12.34,
        'longitude': 56.78,
    }

    @patch('core.services.kindwise.requests.post')
    def test_identify_plant_success(self, mock_post):
        mock_post.return_value = self._ok_response(
            {
                'suggestions': [
                    {'id': 'plant_id_123', 'name': 'Tomato Plant', 'probability': 0.95}
                ],
                'is_plant': {'probability': 0.98},
            }
        )
        client = APIClient()
        response = client.post(self.endpoint, self.test_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('suggestions', response.data)
        self.assertIn('is_plant', response.data)

        mock_post.assert_called_once()
        call_kw = mock_post.call_args
        self.assertEqual(
            call_kw[0][0],
            'https://api.plant.id/v3/identification',
        )
        self.assertEqual(call_kw[1]['json'], self.test_payload)
        self.assertIn('Api-Key', call_kw[1]['headers'])

    @patch('core.services.kindwise.requests.post')
    def test_identify_plant_wraps_single_image_string_as_list(self, mock_post):
        mock_post.return_value = self._ok_response({'suggestions': [], 'is_plant': {}})
        client = APIClient()
        payload = {
            'images': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'latitude': 1.0,
            'longitude': 2.0,
        }
        response = client.post(self.endpoint, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            mock_post.call_args[1]['json']['images'],
            [payload['images']],
        )

    @patch('core.services.kindwise.requests.post')
    def test_identify_plant_upstream_429(self, mock_post):
        mock_post.return_value = self._error_response(
            429, {'detail': 'Too many requests'}
        )
        client = APIClient()
        response = client.post(self.endpoint, self.test_payload, format='json')

        self.assertEqual(response.status_code, 429)
        self.assertEqual(response.data['detail'], 'Too many requests')

    @patch('core.services.kindwise.requests.post')
    def test_identify_plant_connection_error(self, mock_post):
        mock_post.side_effect = OSError('network down')
        client = APIClient()
        with self.assertRaises(OSError):
            client.post(self.endpoint, self.test_payload, format='json')

    @staticmethod
    def _ok_response(data):
        r = MagicMock()
        r.status_code = 200
        r.json.return_value = data
        r.headers = {}
        return r

    @staticmethod
    def _error_response(status_code, body):
        r = MagicMock()
        r.status_code = status_code
        r.json.return_value = body
        r.text = ''
        r.reason = ''
        r.headers = {}
        return r

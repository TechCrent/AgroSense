from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from . import views


class IdentifyPlantTestCase(TestCase):
    
    def setUp(self):
        """Set up test client and base data for each test"""
        self.client = APIClient()
        self.endpoint = '/identify-plant/'
        # Use base64 encoded strings, not file objects
        self.test_payload = {
            'images': ['iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='],
            'latitude': 12.34,
            'longitude': 56.78
        }
    
    @patch('requests.get')
    def test_identify_plant_success(self, mock_get):
        """Test successful plant identification"""
        # Mock the external API response
        mock_response = MagicMock()
        mock_response.json.return_value = {
            'suggestions': [
                {
                    'id': 'plant_id_123',
                    'name': 'Tomato Plant',
                    'probability': 0.95
                }
            ],
            'is_plant': {
                'probability': 0.98
            }
        }
        mock_get.return_value = mock_response
        
        # Make request with JSON data
        response = self.client.post(self.endpoint, self.test_payload, format='json')
        
        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('suggestions', response.data)
        self.assertIn('is_plant', response.data)
        
        # Verify the request was made to the correct endpoint with correct data
        mock_get.assert_called_once()
        call_args = mock_get.call_args
        self.assertEqual(call_args[0][0], 'https://api.plant.id/v2/identification')
        self.assertEqual(call_args[1]['json'], self.test_payload)
        self.assertIn('headers', call_args[1])
    
    @patch('requests.get')
    def test_identify_plant_api_error(self, mock_get):
        """Test handling of external API errors"""
        # Mock API error
        mock_get.side_effect = Exception('API Error')
        
        # Make request and expect error
        with self.assertRaises(Exception):
            self.client.post(self.endpoint, self.test_payload, format='json')
    
    @patch('requests.get')
    def test_identify_plant_http_error(self, mock_get):
        """Test handling of HTTP errors from external API"""
        # Mock HTTP error
        mock_response = MagicMock()
        mock_response.raise_for_status.side_effect = Exception('HTTP 401: Unauthorized')
        mock_get.return_value = mock_response
        
        # Make request and expect error
        with self.assertRaises(Exception):
            self.client.post(self.endpoint, self.test_payload, format='json')

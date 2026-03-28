from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
import requests
from django.conf import settings
import base64

@api_view(['POST'])
def identify_plant(request):
    api_key = settings.PLANT_DETECTION_API_KEY
    headers = {'Api-Key': api_key}
    
    # Prepare the payload for the plant.id API
    payload = {}
    
    # Handle image data - accept base64 strings or file uploads
    if 'images' in request.FILES:
        # If images are uploaded as files, convert to base64
        images = []
        for image_file in request.FILES.getlist('images'):
            image_data = base64.b64encode(image_file.read()).decode('utf-8')
            images.append(image_data)
        payload['images'] = images
    elif 'images' in request.data:
        # If images are already base64 encoded strings
        payload['images'] = request.data.get('images')
    
    # Add latitude and longitude if provided
    if 'latitude' in request.data:
        payload['latitude'] = request.data.get('latitude')
    if 'longitude' in request.data:
        payload['longitude'] = request.data.get('longitude')
    
    
    response = requests.post('https://plant.id/api/v3/identification', json=payload, headers=headers)
    response.raise_for_status()
    data = response.json()
    return Response(data)

@api_view(['POST'])
def assess_plant_health(request):
    api_key = settings.PLANT_DETECTION_API_KEY
    headers = {'Api-Key': api_key}
    
    # Prepare the payload for the plant health API
    payload = {}
    
    # Handle image data - accept base64 strings or file uploads
    if 'images' in request.FILES:
        # If images are uploaded as files, convert to base64
        images = []
        for image_file in request.FILES.getlist('images'):
            image_data = base64.b64encode(image_file.read()).decode('utf-8')
            images.append(image_data)
        payload['images'] = images
    elif 'images' in request.data:
        # If images are already base64 encoded strings
        payload['images'] = request.data.get('images')
    
    response = requests.post('https://plant.id/api/v3/health_assessment', json=payload, headers=headers)
    response.raise_for_status()
    data = response.json()
    return Response(data)
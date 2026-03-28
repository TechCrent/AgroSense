from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
import requests
from django.conf import settings
import base64


def _upstream_error_response(r):
    """Map a failed requests.Response to a DRF Response (preserves status, e.g. 429)."""
    try:
        body = r.json()
    except ValueError:
        body = {'detail': (r.text or r.reason or 'Upstream error').strip()}
    resp = Response(body, status=r.status_code)
    retry_after = r.headers.get('Retry-After')
    if retry_after:
        resp['Retry-After'] = retry_after
    return resp


def _json_or_response(result):
    if isinstance(result, Response):
        return result
    return Response(result)


def _plant_id_payload_from_request(request):
    """Build JSON body for plant.id (images + optional geo), same for identification and health."""
    payload = {}
    if 'images' in request.FILES:
        images = []
        for image_file in request.FILES.getlist('images'):
            image_data = base64.b64encode(image_file.read()).decode('utf-8')
            images.append(image_data)
        payload['images'] = images
    elif 'images' in request.data:
        payload['images'] = request.data.get('images')
    if 'latitude' in request.data:
        payload['latitude'] = request.data.get('latitude')
    if 'longitude' in request.data:
        payload['longitude'] = request.data.get('longitude')
    return payload


def _post_plant_id(path_suffix, payload):
    api_key = settings.PLANT_DETECTION_API_KEY
    headers = {'Api-Key': api_key}
    base = settings.PLANT_API_URL.rstrip('/')
    r = requests.post(f'{base}/{path_suffix}', json=payload, headers=headers)
    if r.status_code >= 400:
        return _upstream_error_response(r)
    return r.json()


def _post_crop_kindwise(path_suffix, payload):
    api_key = settings.PLANT_HEALTH_API_KEY
    headers = {'Api-Key': api_key}
    base = settings.CROP_API_URL.rstrip('/')
    r = requests.post(f'{base}/{path_suffix}', json=payload, headers=headers)
    if r.status_code >= 400:
        return _upstream_error_response(r)
    return r.json()


@api_view(['POST'])
def identify_plant(request):
    payload = _plant_id_payload_from_request(request)
    return _json_or_response(_post_plant_id('identification', payload))


@api_view(['POST'])
def assess_plant_health(request):
    payload = _plant_id_payload_from_request(request)
    return _json_or_response(_post_plant_id('health_assessment', payload))


@api_view(['POST'])
def identify_crop(request):
    payload = _plant_id_payload_from_request(request)
    return _json_or_response(_post_crop_kindwise('identification', payload))

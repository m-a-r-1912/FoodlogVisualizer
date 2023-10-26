import os
import json
import requests
import base64
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework import status
from django.conf import settings
from django.db.utils import IntegrityError
from utils.fitbit import FitBitClient
from oauthlib.oauth2 import WebApplicationClient

from .models import User
from logging import getLogger
from utils.constants import FOODLOG_FILENAME, FOODLOG_FOLDERNAME
from utils.analytics import Analytics

logger = getLogger(__name__)

#An endpoint to return the foodlog data to the frontend
@api_view(['GET'])
def getData(request):
    file_path = os.path.join(settings.BASE_DIR, FOODLOG_FOLDERNAME, FOODLOG_FILENAME+".json")
    fitbit_json={}
    
    try:
        with open(file_path, "r") as file:
            fitbit_json = json.load(file)
    except FileNotFoundError as e:
        logger.error("Foodlog file could not be found")
        raise FileNotFoundError("Error doing analytics. Foodlog data was not imported as expected.")
    except json.JSONDecodeError as e:
        logger.error(f"Foodlog file has invalid JSON: {e}")
        raise ValueError("Error doing analytics. Foodlog data has invalid JSON.")
    except Exception as e:
        logger.error(f"There was some error opening the foodlog file: {e}")
        raise RuntimeError("An unexpected error occurred.")
    
    analytics = Analytics("sodium", fitbit_json).get_standard_analytics()
    response_data = {"foodlog":fitbit_json, "analytics":analytics}

    return Response(response_data)

#logging in by exchanging the authorization code for access/refresh tokens and expiration time by using the FitBit token endpoint
@api_view(['POST'])
def login(request):
    access_token_url = "https://api.fitbit.com/oauth2/token"
    authorization_code = request.data.get('authorization_code')
    code_verifier = request.data.get('code_verifier')

    if not authorization_code or not code_verifier:
        return Response({'error': 'Missing required parameters'}, status=status.HTTP_400_BAD_REQUEST)
    
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    }
    data = {
        "client_id": settings.FITBIT_CLIENT_ID,
        "code_verifier": code_verifier,
        "code" : authorization_code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.FITBIT_OAUTH_REDIRECT,
    }

    #Make the token request
    response = requests.post(access_token_url, headers=headers, data=data)

    if response.ok:
        response_data = json.loads(response.text)

        #Update the User (probably need to move this code to somewhere else)
        logger.info("Response data: ", response_data)
        fitbit_id = response_data.get("user_id")
        access_token = response_data.get("access_token")
        expires_in = response_data.get("expires_in")
        refresh_token = response_data.get("refresh_token")
        
        created = None
        user = None
        # try:
        user, created = User.objects.get_or_create(
            fitbit_id=fitbit_id,
            defaults={
                'access_token': access_token,
                'expires_in': expires_in,
                'refresh_token': refresh_token,
            }
        )
        # except IntegrityError:
        #     user = User.objects.get(fitbit_id=fitbit_id)

        if not created:
            # If the user already existed, we update the tokens and expiry if they've changed.
            update_fields = []
            if user.access_token != access_token:
                user.access_token = access_token
                update_fields.append('access_token')
            if user.expires_in != expires_in:
                user.expires_in = expires_in
                update_fields.append('expires_in')
            if user.refresh_token != refresh_token:
                user.refresh_token = refresh_token
                update_fields.append('refresh_token')

            if update_fields:
                user.save(update_fields=update_fields)
        
        #create token using Django REST Framework 
        token, created = Token.objects.get_or_create(user=user)
        if created:
            logger.info("A new token has been created")
        return Response({'token': token.key}, status=status.HTTP_200_OK)
    else:
        return Response(response, status=response.status_code)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def downloadData(request):

    #Getting the token value just for logging while developing
    token_header = request.META.get('HTTP_AUTHORIZATION')
    token_value = None
    if token_header and token_header.startswith('Token '):
        token_value = token_header.split(' ')[1]
    logger.info(f"Token Value, |{token_value}|")

    user = request.user

    #Get the 'days_back' parameter from the POST data
    days_back = request.data.get('days_back')
    if not days_back:
        return Response({'error': 'Missing required parameter `days_back`'}, status=status.HTTP_400_BAD_REQUEST)

    client = FitBitClient(user.access_token)
    
    #downloading data from Fitbit
    try:
        client.get_foodlog(days_back)
        return Response({"message": "Data downloaded successfully."}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error while getting food log: {e}")

        if len(e.args)>1 and e.args[1] >= 400 and e.args[1] < 500:
            return Response(data={"error": f"{e.args[0]}"}, status=e.args[1])
        else:
            return Response("error: There was an error fetching data", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        # Delete the token to force a log out
        request.auth.delete()
        return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": f"Error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
    


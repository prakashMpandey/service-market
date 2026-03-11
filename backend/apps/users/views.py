from django.shortcuts import render
from rest_framework import generics
from .models import User
from .serializers import CreateUserSerializer
from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
# Create your views here.



class CreateUserView(generics.CreateAPIView):
    model=User
    serializer_class=CreateUserSerializer


class LogoutView(APIView):
    permission_classes=[permissions.IsAuthenticated]

    def post(self,request):
        try:
            refresh_token=request.data['refresh_token']
            if not refresh_token:
               return  Response({"message": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)
            token=RefreshToken(refresh_token)
            token.blacklist()
        
            return Response({"message":"user logged out successfully"},status=status.HTTP_205_RESET_CONTENT)
        
        except Exception as e:
             
         print(e)
         return Response({"message":'user cannot be logged out'},status=status.HTTP_400_BAD_REQUEST)
        





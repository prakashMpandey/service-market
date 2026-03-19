from django.shortcuts import render
from rest_framework import generics
from .models import User
from .serializers import CreateUserSerializer,UpdateUserLocationSerializer,ProfilePhotoSerializer,CustomTokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .permissions import isProvider
from .tasks import send_welcome_email
from rest_framework.parsers import MultiPartParser,FormParser
from rest_framework.decorators import permission_classes,api_view,parser_classes
from apps.booking.models import Booking,Payment
from apps.services.models import Service
from django.db.models import Count,Sum,Avg,Q
from django.utils import timezone


# Custom login view — adds 'role' and 'username' to the JWT payload
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # class-level, properly enforced

    def get(self, request):
        try:
            current_month = timezone.now().month
            user = request.user
            summary = Booking.objects.filter(service__provider=user).aggregate(
                total_bookings=Count('id'),
                total_earning=Sum('amount', filter=Q(status='completed')),
                monthly_earning=Sum('amount', filter=Q(status='completed') & Q(created_at__month=current_month))
            )

            stats = Booking.objects.filter(service__provider=user).values('status').annotate(count=Count('status'))

            recent_bookings = Booking.objects.filter(service__provider=user).values(
                'id', 'customer__username', 'amount', 'status', 'created_at'
            ).order_by('-created_at')[:5]

            return Response({
                "summary": summary,
                "stats": stats,
                "recent_bookings": recent_bookings
            })

        except Exception as e:
            print(f"error occured {e}")
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreateUserView(generics.CreateAPIView):
    model = User
    serializer_class = CreateUserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        # send_welcome_email.delay_on_commit(user.id)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            # Accept either 'refresh' or 'refresh_token' key
            refresh_token = request.data.get('refresh') or request.data.get('refresh_token')
            if not refresh_token:
                return Response({"message": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "user logged out successfully"}, status=status.HTTP_205_RESET_CONTENT)

        except Exception as e:
            print(e)
            return Response({"message": 'user cannot be logged out'}, status=status.HTTP_400_BAD_REQUEST)


class UpdateLocationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        user = request.user
        serializer = UpdateUserLocationSerializer(user, data=request.data, partial=True)
        serializer.is_valid()
        serializer.save()
        return Response({"message": "location updated successfully"}, status=status.HTTP_206_PARTIAL_CONTENT)


class GetUserDetails(generics.RetrieveAPIView):
    permission_classes=[permissions.IsAuthenticated]
    def  get_queryset(self):
        return self.request.user

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def AddProfilePicture(request):
    serializer = ProfilePhotoSerializer(request.user, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response({
            "message": "photo uploaded successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

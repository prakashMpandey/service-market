from .models import Booking
from apps.services.models import Service
from rest_framework import serializers

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model=Booking
        fields=['customer','service','status','address','status','booking_date']
        
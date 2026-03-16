from .models import Booking
from apps.services.models import Service
from rest_framework import serializers
from datetime import datetime
from django.utils import timezone
from rest_framework.exceptions import ValidationError

# class CreateBookingSerializer(serializers.ModelSerializer):
#      class Meta:
#           model=Booking
#           fields=['id','service','address','']

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model=Booking
        fields=['id','service','address','booking_date','status']
        read_only_fields=('id',)

    def validate_booking_date(self,value):
    # Hamesha timezone-aware datetime use karna chahiye
     if value < timezone.now():
        raise serializers.ValidationError("enter a valid date!")
     return value
         
         

class BookingStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model=Booking
        fields=['status']

class BookingStartSerializer(serializers.Serializer):
     arrival_otp=serializers.CharField(max_length=4)

class CustomerBookingSerializer(serializers.ModelSerializer):
     
     service_title=serializers.CharField(source='service.title',read_only=True)
     service_price=serializers.DecimalField(max_digits=10,decimal_places=2,source='service.price',read_only=True)
     service_provider=serializers.CharField(source='service.provider.name',read_only=True)
     service_provider_tel=serializers.CharField(source='service.provider.phone',read_only=True)

     class Meta:
          model=Booking
          fields=['id','service_title','service_price','service_provider','service_provider_tel','address','status','arrival_otp','completion_otp','is_paid']


class ProviderBookingSerializer(serializers.ModelSerializer):
     
     service_title=serializers.CharField(source='service.title',read_only=True)
     service_price=serializers.DecimalField(max_digits=10,decimal_places=2,source='service.price',read_only=True)
     customer_name=serializers.CharField(source='customer.name',read_only=True)
     customer_phone=serializers.CharField(source='customer.phone',read_only=True)
     class Meta:
          model=Booking
          fields=['id','service_title','service_price','customer_phone','customer_name','address','status']
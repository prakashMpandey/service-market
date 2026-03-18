from .models import Booking
from apps.services.models import Service
from rest_framework import serializers
from datetime import datetime
from django.utils import timezone
from rest_framework.exceptions import ValidationError

class BookingSerializer(serializers.ModelSerializer):
    service_title=serializers.CharField(source='service.title')
    class Meta:
        model=Booking
        fields=['id','service','service_title','address','booking_date','status','amount','is_paid','payment_method']
        read_only_fields=('id','amount','is_paid','service_title')
        

    def validate_booking_date(self,value):
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
    # User model uses 'username', not 'name'
    service_provider=serializers.CharField(source='service.provider.username',read_only=True)
    service_provider_tel=serializers.CharField(source='service.provider.phone',read_only=True)

    class Meta:
        model=Booking
        fields=[
            'id','booking_date','amount','address','status',
            'service_title','service_price','service_provider','service_provider_tel',
            'arrival_otp','completion_otp','is_paid','payment_method',
        ]


class ProviderBookingSerializer(serializers.ModelSerializer):
    service_title=serializers.CharField(source='service.title',read_only=True)
    service_price=serializers.DecimalField(max_digits=10,decimal_places=2,source='service.price',read_only=True)
    # User model uses 'username', not 'name'
    customer_name=serializers.CharField(source='customer.username',read_only=True)
    customer_phone=serializers.CharField(source='customer.phone',read_only=True)

    class Meta:
        model=Booking
        fields=[
            'id','address','status','booking_date',
            'service_title','service_price',
            'customer_name','customer_phone',
            'amount','payment_method','is_paid',
        ]

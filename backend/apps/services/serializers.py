from .models import Service,ServiceCategory
from rest_framework import serializers


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model=Service
        fields=['title','category','description','price','location']
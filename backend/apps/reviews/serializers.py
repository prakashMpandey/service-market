from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model=Review
        fields=['comment','rating','user','service']
        extra_kwargs={'user':{"read_only":True}}


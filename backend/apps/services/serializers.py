from .models import Service,ServiceCategory
from apps.reviews.models import Review
from rest_framework import serializers
from .utils import calculate_distance



class CategorySerializer(serializers.ModelSerializer):
        class Meta:
            model=ServiceCategory
            fields=['id','name']

class CreateServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['title', 'category', 'description', 'price', 'id', 'image']
        extra_kwargs = {"id": {"read_only": True}}

    def validate_image(self, value):
        limit = 3 * 1024 * 1024
        if value.size > limit:
            raise serializers.ValidationError("photo is larger than 3MB.reduce the size of image")
        
        valid_extensions = ['.jpg', '.jpeg', '.png']
        import os
        ext = os.path.splitext(value.name)[1]
        if not ext.lower() in valid_extensions:
            raise serializers.ValidationError("only JPG and PNG images are allowed")
        return value

class ServiceSerializer(serializers.ModelSerializer):

    category=CategorySerializer()
    class Meta:
        model = Service
        fields = ['title', 'category', 'description', 'price', 'id', 'image']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.image:
            representation['image'] = instance.image.url
        return representation



class ServiceSerializerWithReviews(serializers.ModelSerializer):
    class ReviewSerializer(serializers.ModelSerializer):
        username = serializers.CharField(source='user.username')
        class Meta:
            model = Review
            fields = ['comment', 'rating', 'username', 'id']

    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Service
        fields = ['title', 'image', 'category', 'description', 'price', 'id', 'reviews']

    # Detail view mein bhi Full URL ke liye
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.image:
            representation['image'] = instance.image.url
        return representation


class NearbyServiceSerializer(serializers.ModelSerializer): 
    category = CategorySerializer(read_only=True)
    distance = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ['title', 'category', 'description', 'price', 'id', 'distance', 'image']
        extra_kwargs = {"id": {"read_only": True}}

    def get_distance(self, obj):
        try:
            user_lat = float(self.context['lat'])
            user_lng = float(self.context["lng"])
            provider_lat = float(obj.provider.latitude)
            provider_lng = float(obj.provider.longitude)
            return calculate_distance(user_lat, user_lng, provider_lat, provider_lng)
        except (KeyError, TypeError, ValueError):
            return None

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.image:
            representation['image'] = instance.image.url
        return representation
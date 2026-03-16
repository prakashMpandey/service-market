from .models import Service,ServiceCategory
from apps.reviews.models import Review
from rest_framework import serializers
from .utils import calculate_distance

class ServiceSerializer(serializers.ModelSerializer):

    class Meta:
        model=Service
        fields=['title','category','description','price','location','id','image']
        extra_kwargs={"id":{"read_only":True},"image":{"write_only":True}}

    def validate_image(self,value):
        limit=3*1024*1024
        if value.size > limit:
            raise serializers.ValidationError("photo is larger than 3MB.reduce the size of image")
        
        valid_extensions = ['.jpg', '.jpeg', '.png']
        import os
        ext = os.path.splitext(value.name)[1]
        if not ext.lower() in valid_extensions:
            raise serializers.ValidationError("only JPG and PNG  images are allowed")

        return value


class ServiceSerializerWithReviews(serializers.ModelSerializer):

    class ReviewSerializer(serializers.ModelSerializer):
        username=serializers.CharField(source='user.username')
        class Meta:
            model=Review
            fields=['comment','rating','username','id']
    reviews=ReviewSerializer(many=True)   
    class Meta:
        model=Service
        fields=['title','category','description','price','location','id','reviews']
   


class NearbyServiceSerializer(serializers.ModelSerializer): 

    distance=serializers.SerializerMethodField()
    class Meta:
        model=Service
        fields=['title','category','description','price','location','id','distance']
        extra_kwargs={"id":{"read_only":True}}

    def get_distance(self,obj):
        print(self.context)
        user_lat=float(self.context['lat'])
        user_lng = float(self.context["lng"])

        provider_lat = float(obj.provider.latitude)
        provider_lng = float(obj.provider.longitude)

        return calculate_distance(user_lat,user_lng,provider_lat,provider_lng)
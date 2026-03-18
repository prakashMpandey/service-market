from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        return token

class CreateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['username','email','role','password']
        extra_kwargs={"password":{"write_only":True}}

    
    def create(self,validated_data):
        return User.objects.create_user(**validated_data)


class UpdateUserLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['latitude','longitude','radius']
    

    def update(self, instance, validated_data):
        instance.latitude = validated_data.get('latitude', instance.latitude)
        instance.longitude = validated_data.get('longitude', instance.longitude)
        instance.radius = validated_data.get('radius', instance.radius)

        instance.save()
        return instance
    
class ProfilePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['profile_photo']

    
    def validate_profile_photo(self,value):
        limit=3*1024*1024
        if value.size > limit:
            raise serializers.ValidationError("photo is larger than 3MB.reduce the size of image")
        
        valid_extensions = ['.jpg', '.jpeg', '.png']
        import os
        ext = os.path.splitext(value.name)[1]
        if not ext.lower() in valid_extensions:
            raise serializers.ValidationError("only JPG and PNG  images are allowed")

        return value

# class UserDetailsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=User
#         fields=['username','role']
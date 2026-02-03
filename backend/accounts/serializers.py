from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = UserProfile
        fields = ['avatar']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)


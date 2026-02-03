from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Task

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class TaskSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('created_at', 'created_by')

    def create(self, validated_data):
        # Automatically assign current user as creator
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

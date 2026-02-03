from rest_framework import generics, permissions, parsers, status
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import UserProfile
from .serializers import UserSerializer, UserProfileSerializer

class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class AvatarUploadView(generics.UpdateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class ChangePasswordView(generics.GenericAPIView):
    serializer_class = UserSerializer # Not used effectively but required by GenericAPIView
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        from .serializers import ChangePasswordSerializer
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            if serializer.data.get("new_password") != serializer.data.get("confirm_password"):
                return Response({"new_password": ["Passwords do not match."]}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.data.get("new_password"))
            user.save()
            return Response({"status": "password set"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

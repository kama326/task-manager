from django.urls import path
from . import views
from .views import UserDetailView, AvatarUploadView

urlpatterns = [
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('avatar/', AvatarUploadView.as_view(), name='avatar-upload'),
    path('password/', views.ChangePasswordView.as_view(), name='change-password'),
]

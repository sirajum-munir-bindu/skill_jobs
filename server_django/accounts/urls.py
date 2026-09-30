from django.urls import path
from .views import (
    UserRegisterView,
    UserLoginView,
    UserProfileUpdateView,
    UserListCreateView,
    UserBulkDeleteView,
    UserDetailView
)

urlpatterns = [
    path('auth/register', UserRegisterView.as_view(), name='auth-register'),
    path('auth/login', UserLoginView.as_view(), name='auth-login'),
    path('users/login', UserLoginView.as_view(), name='users-login-alias'),
    path('auth/update', UserProfileUpdateView.as_view(), name='auth-update'),
    path('users/bulk-delete', UserBulkDeleteView.as_view(), name='users-bulk-delete'),
    path('users', UserListCreateView.as_view(), name='users-list-create'),
    path('users/<str:id>', UserDetailView.as_view(), name='users-detail'),
]

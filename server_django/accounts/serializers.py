from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    _id = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', '_id', 'name', 'email', 'role', 'permissions', 'createdAt']

    def get__id(self, obj):
        return obj.id


class UserRegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserProfileUpdateSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=100)
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(required=False, allow_blank=True, write_only=True)


class AdminUserCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(max_length=100, default="Participant", required=False)
    permissions = serializers.ListField(child=serializers.CharField(), required=False, default=None)


class AdminUserUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    role = serializers.CharField(max_length=100, default="Participant", required=False)
    password = serializers.CharField(required=False, allow_blank=True, write_only=True)
    permissions = serializers.ListField(child=serializers.CharField(), required=False, default=None)


class BulkDeleteUsersSerializer(serializers.Serializer):
    userIds = serializers.ListField(child=serializers.CharField())

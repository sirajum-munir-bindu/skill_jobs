import time
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import CustomUser
from .serializers import (
    UserSerializer,
    UserRegisterSerializer,
    UserLoginSerializer,
    UserProfileUpdateSerializer,
    AdminUserCreateSerializer,
    AdminUserUpdateSerializer,
    BulkDeleteUsersSerializer
)


class UserRegisterView(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": "Invalid registration data", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        email = data['email'].strip().lower()

        if CustomUser.objects.filter(email__iexact=email).exists():
            return Response({"detail": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

        new_id = f"usr_{int(time.time() * 1000)}"
        now_str = datetime.now().isoformat()

        user = CustomUser(
            id=new_id,
            name=data['name'].strip(),
            email=email,
            role="Participant",
            permissions=[],
            createdAt=now_str
        )
        user.set_password(data['password'])
        user.save()

        return Response({
            "message": "Registration successful",
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class UserLoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": "Invalid login data"}, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].strip().lower()
        password = serializer.validated_data['password']

        user = CustomUser.objects.filter(email__iexact=email).first()
        if user and user.check_password(password):
            return Response({
                "message": "Login successful",
                "user": UserSerializer(user).data
            }, status=status.HTTP_200_OK)

        return Response({
            "detail": "Invalid administrator email or password."
        }, status=status.HTTP_401_UNAUTHORIZED)


class UserProfileUpdateView(APIView):
    def put(self, request):
        serializer = UserProfileUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": "Invalid update data", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        user_id = data['id']
        email = data['email'].strip().lower()

        user = CustomUser.objects.filter(id=user_id).first()
        if not user:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if user.email.lower() != email:
            if CustomUser.objects.filter(email__iexact=email).exclude(id=user_id).exists():
                return Response({"detail": "Email already taken"}, status=status.HTTP_400_BAD_REQUEST)

        user.name = data['name'].strip()
        user.email = email
        if data.get('password'):
            user.set_password(data['password'])
        user.save()

        return Response({
            "message": "Profile updated successfully",
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class UserListCreateView(APIView):
    def get(self, request):
        users = CustomUser.objects.all().order_by('-createdAt')
        return Response(UserSerializer(users, many=True).data)

    def post(self, request):
        serializer = AdminUserCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": "Invalid user data", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        email = data['email'].strip().lower()

        if CustomUser.objects.filter(email__iexact=email).exists():
            return Response({"detail": "Email is already in use."}, status=status.HTTP_400_BAD_REQUEST)

        now_str = datetime.now().isoformat()
        new_id = f"usr_{int(time.time() * 1000)}"
        perm_list = data.get('permissions')
        if perm_list is None:
            perm_list = [
                "users", "ambassadors", "ambassadortasks", "ambassadordashboard",
                "homepage", "aboutpage", "ambassadorpage", "contactpage", "contactmessages"
            ]

        user = CustomUser(
            id=new_id,
            name=data['name'].strip(),
            email=email,
            role=data.get('role') or "Participant",
            permissions=perm_list,
            createdAt=now_str
        )
        if user.role == "Super Admin":
            user.is_staff = True
            user.is_superuser = True
        elif user.role == "Admin":
            user.is_staff = True

        user.set_password(data['password'])
        user.save()

        return Response({
            "message": "User created successfully!",
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class UserDetailView(APIView):
    def put(self, request, id):
        serializer = AdminUserUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": "Invalid user update data", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        clean_email = data['email'].strip().lower()

        user = CustomUser.objects.filter(Q(id=id) | Q(email__iexact=clean_email)).first()
        if not user:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.email.lower() != clean_email:
            if CustomUser.objects.filter(email__iexact=clean_email).exclude(id=user.id).exists():
                return Response({"detail": "Email is already in use by another user."}, status=status.HTTP_400_BAD_REQUEST)

        user.name = data['name'].strip()
        user.email = clean_email
        if data.get('role'):
            user.role = data['role']
            if user.role == "Super Admin":
                user.is_staff = True
                user.is_superuser = True
            elif user.role == "Admin":
                user.is_staff = True

        if data.get('password') and data['password'].strip():
            user.set_password(data['password'].strip())

        if data.get('permissions') is not None:
            user.permissions = data['permissions']

        user.save()

        # If user is also an ambassador, synchronize password
        try:
            from ambassadors.models import Ambassador
            amb = Ambassador.objects.filter(email__iexact=clean_email).first()
            if amb and data.get('password') and data['password'].strip():
                amb.password = data['password'].strip()
                amb.save(update_fields=['password'])
        except Exception:
            pass

        return Response({
            "message": "User updated successfully!",
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)

    def delete(self, request, id):
        user = CustomUser.objects.filter(id=id).first()
        if not user:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        user.delete()
        return Response({"message": "User deleted successfully."}, status=status.HTTP_200_OK)


class UserBulkDeleteView(APIView):
    def post(self, request):
        serializer = BulkDeleteUsersSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": "Invalid user IDs payload"}, status=status.HTTP_400_BAD_REQUEST)

        user_ids = serializer.validated_data['userIds']
        deleted_count, _ = CustomUser.objects.filter(id__in=user_ids).delete()

        return Response({
            "message": f"{deleted_count} user accounts deleted successfully.",
            "deletedCount": deleted_count
        }, status=status.HTTP_200_OK)

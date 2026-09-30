from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.contrib.auth.hashers import make_password, check_password as django_check_password
import json

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', 'Super Admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, db_index=True)
    role = models.CharField(max_length=100, default='Participant')
    permissions = models.JSONField(default=list, blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    createdAt = models.CharField(max_length=100, blank=True, null=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = 'users'
        ordering = ['-createdAt']

    def __str__(self):
        return f"{self.name} ({self.email})"

    def check_password(self, raw_password):
        """Check hashed password with fallback to legacy plaintext migration."""
        if not self.password:
            return False
        # If standard Django hash
        if self.password.startswith('pbkdf2_') or self.password.startswith('argon2') or self.password.startswith('bcrypt'):
            return django_check_password(raw_password, self.password)
        # Direct plaintext comparison for legacy seed data
        if self.password == raw_password:
            # Upgrade password to secure hash automatically
            self.set_password(raw_password)
            self.save(update_fields=['password'])
            return True
        return False

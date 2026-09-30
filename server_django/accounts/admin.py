from django.contrib import admin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'role', 'is_staff', 'createdAt')
    search_fields = ('name', 'email', 'role')
    list_filter = ('role', 'is_staff')

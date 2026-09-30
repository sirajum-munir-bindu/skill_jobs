from django.contrib import admin
from .models import Ambassador, WorkReport

@admin.register(Ambassador)
class AmbassadorAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'university', 'dept', 'role', 'status', 'createdAt')
    search_fields = ('name', 'email', 'university', 'phone')
    list_filter = ('status', 'university', 'role')

@admin.register(WorkReport)
class WorkReportAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'institution', 'ambassadorEmail', 'status', 'createdAt')
    search_fields = ('name', 'email', 'phone', 'ambassadorEmail')
    list_filter = ('status', 'institution')

from django.contrib import admin
from .models import Event, SiteConfig, ContactMessage

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'location', 'category', 'status', 'createdAt')
    search_fields = ('title', 'location', 'category')
    list_filter = ('category', 'status')

@admin.register(SiteConfig)
class SiteConfigAdmin(admin.ModelAdmin):
    list_display = ('key', 'updatedAt')
    search_fields = ('key',)

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'createdAt')
    search_fields = ('name', 'email', 'subject', 'message')

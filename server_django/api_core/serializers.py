from rest_framework import serializers
from .models import Event, SiteConfig, ContactMessage

class EventSerializer(serializers.ModelSerializer):
    _id = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ['id', '_id', 'title', 'date', 'time', 'location', 'image', 'category', 'status', 'regLink', 'createdAt', 'updatedAt']

    def get__id(self, obj):
        return obj.id


class ContactMessageSerializer(serializers.ModelSerializer):
    _id = serializers.SerializerMethodField()

    class Meta:
        model = ContactMessage
        fields = ['id', '_id', 'name', 'email', 'subject', 'message', 'createdAt']

    def get__id(self, obj):
        return obj.id


class ContactSubmitSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    subject = serializers.CharField(max_length=255)
    message = serializers.CharField()


class ConfigUpsertSerializer(serializers.Serializer):
    key = serializers.CharField(max_length=100)
    value = serializers.JSONField()

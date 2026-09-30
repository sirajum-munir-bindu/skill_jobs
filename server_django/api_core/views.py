import random
import string
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from .models import Event, SiteConfig, ContactMessage
from .serializers import (
    EventSerializer,
    ContactMessageSerializer,
    ContactSubmitSerializer,
    ConfigUpsertSerializer
)


def health_check(request):
    return JsonResponse({
        "status": "ok",
        "message": "Skill Jobs Django REST API is running successfully.",
        "backend": "Django + PostgreSQL"
    })


class EventListCreateView(APIView):
    def get(self, request):
        events = Event.objects.all().order_by('-createdAt')
        return Response(EventSerializer(events, many=True).data)

    def post(self, request):
        data = request.data
        new_id = "evt-" + "".join(random.choices(string.ascii_lowercase + string.digits, k=9))
        now_str = datetime.now().isoformat()
        event_status = data.get('status') or 'Upcoming'

        event = Event.objects.create(
            id=new_id,
            title=data.get('title', ''),
            date=data.get('date', ''),
            time=data.get('time', ''),
            location=data.get('location', ''),
            image=data.get('image', ''),
            category=data.get('category', ''),
            status=event_status,
            regLink=data.get('regLink', ''),
            createdAt=now_str,
            updatedAt=now_str
        )

        return Response({
            "message": "Event created successfully!",
            "event": EventSerializer(event).data
        }, status=status.HTTP_201_CREATED)


class EventDetailView(APIView):
    def put(self, request, id):
        event = Event.objects.filter(id=id).first()
        if not event:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        now_str = datetime.now().isoformat()

        event.title = data.get('title', event.title)
        event.date = data.get('date', event.date)
        event.time = data.get('time', event.time)
        event.location = data.get('location', event.location)
        event.image = data.get('image', event.image)
        event.category = data.get('category', event.category)
        event.status = data.get('status', event.status) or 'Upcoming'
        event.regLink = data.get('regLink', event.regLink)
        event.updatedAt = now_str
        event.save()

        return Response({
            "message": "Event updated successfully!",
            "event": EventSerializer(event).data
        }, status=status.HTTP_200_OK)

    def delete(self, request, id):
        event = Event.objects.filter(id=id).first()
        if not event:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

        serialized = EventSerializer(event).data
        event.delete()

        return Response({
            "message": "Event deleted successfully!",
            "event": serialized
        }, status=status.HTTP_200_OK)


class ConfigView(APIView):
    def get(self, request):
        configs = SiteConfig.objects.all()
        result = {}
        for c in configs:
            result[c.key] = c.value
        return Response(result)

    def post(self, request):
        serializer = ConfigUpsertSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": "Invalid config data", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        key = serializer.validated_data['key']
        val = serializer.validated_data['value']
        now_str = datetime.now().isoformat()

        cfg, _ = SiteConfig.objects.update_or_create(
            key=key,
            defaults={'value': val, 'updatedAt': now_str}
        )

        return Response({
            "message": f"Config {key} saved successfully!",
            "config": {"key": cfg.key, "value": cfg.value}
        }, status=status.HTTP_200_OK)


class ContactSubmitView(APIView):
    def post(self, request):
        serializer = ContactSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": "Invalid contact message", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        new_id = "msg-" + "".join(random.choices(string.ascii_lowercase + string.digits, k=9))
        now_str = datetime.now().isoformat()

        msg = ContactMessage.objects.create(
            id=new_id,
            name=data['name'].strip(),
            email=data['email'].strip(),
            subject=data['subject'].strip(),
            message=data['message'].strip(),
            createdAt=now_str
        )

        return Response({
            "message": "Message sent successfully!",
            "contactMessage": ContactMessageSerializer(msg).data
        }, status=status.HTTP_201_CREATED)


class MessageListView(APIView):
    def get(self, request):
        messages = ContactMessage.objects.all().order_by('-createdAt')
        return Response(ContactMessageSerializer(messages, many=True).data)


class MessageDetailView(APIView):
    def delete(self, request, id):
        msg = ContactMessage.objects.filter(id=id).first()
        if not msg:
            return Response({"detail": "Message not found."}, status=status.HTTP_404_NOT_FOUND)

        serialized = ContactMessageSerializer(msg).data
        msg.delete()

        return Response({
            "message": "Message deleted successfully!",
            "contactMessage": serialized
        }, status=status.HTTP_200_OK)

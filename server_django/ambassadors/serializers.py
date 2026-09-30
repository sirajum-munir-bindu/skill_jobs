from rest_framework import serializers
from .models import Ambassador, WorkReport

class AmbassadorSerializer(serializers.ModelSerializer):
    _id = serializers.SerializerMethodField()

    class Meta:
        model = Ambassador
        fields = [
            'id', '_id', 'name', 'email', 'university', 'reason', 'status',
            'phone', 'dept', 'year', 'linkedin', 'role', 'image', 'password', 'createdAt'
        ]

    def get__id(self, obj):
        return obj.id


class AmbassadorApplySerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    phone = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    university = serializers.CharField(max_length=255)
    reason = serializers.CharField()
    image = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    role = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    dept = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    year = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    linkedin = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    status = serializers.CharField(max_length=100, default='Pending', required=False)


class AmbassadorUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=False, allow_null=True, allow_blank=True)
    email = serializers.EmailField(required=False, allow_null=True, allow_blank=True)
    phone = serializers.CharField(max_length=100, required=False, allow_null=True, allow_blank=True)
    university = serializers.CharField(max_length=255, required=False, allow_null=True, allow_blank=True)
    reason = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    image = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    role = serializers.CharField(max_length=100, required=False, allow_null=True, allow_blank=True)
    dept = serializers.CharField(max_length=100, required=False, allow_null=True, allow_blank=True)
    status = serializers.CharField(max_length=100, required=False, allow_null=True, allow_blank=True)


class AmbassadorStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['Pending', 'Approved', 'Rejected'])


class WorkReportSerializer(serializers.ModelSerializer):
    _id = serializers.SerializerMethodField()

    class Meta:
        model = WorkReport
        fields = [
            'id', '_id', 'ambassadorEmail', 'ambassadorName', 'name', 'email',
            'phone', 'institution', 'status', 'createdAt'
        ]

    def get__id(self, obj):
        return obj.id


class WorkReportCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=100)
    ambassadorEmail = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    ambassadorName = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    institution = serializers.CharField(max_length=255, default="Campus Member", required=False, allow_blank=True)
    status = serializers.CharField(max_length=100, default="Pending", required=False)
    createdAt = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)


class WorkReportUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    phone = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    institution = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    status = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)


class WorkReportStatusSerializer(serializers.Serializer):
    status = serializers.CharField(max_length=100)

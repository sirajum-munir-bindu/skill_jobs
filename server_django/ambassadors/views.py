import time
import random
import string
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Ambassador, WorkReport
from .serializers import (
    AmbassadorSerializer,
    AmbassadorApplySerializer,
    AmbassadorUpdateSerializer,
    AmbassadorStatusSerializer,
    WorkReportSerializer,
    WorkReportCreateSerializer,
    WorkReportUpdateSerializer,
    WorkReportStatusSerializer
)


class AmbassadorListCreateView(APIView):
    def get(self, request):
        ambassadors = Ambassador.objects.all().order_by('-createdAt')
        return Response(AmbassadorSerializer(ambassadors, many=True).data)


class AmbassadorApplyView(APIView):
    def post(self, request):
        serializer = AmbassadorApplySerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": "Invalid application data", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        new_id = "amb-" + "".join(random.choices(string.ascii_lowercase + string.digits, k=9))
        now_str = datetime.now().isoformat()

        ambassador = Ambassador.objects.create(
            id=new_id,
            name=data.get('name'),
            email=data.get('email'),
            phone=data.get('phone'),
            university=data.get('university'),
            reason=data.get('reason'),
            role=data.get('role'),
            dept=data.get('dept'),
            year=data.get('year'),
            linkedin=data.get('linkedin'),
            image=data.get('image'),
            status=data.get('status') or 'Pending',
            createdAt=now_str
        )

        return Response({
            "message": "Application submitted successfully!",
            "application": AmbassadorSerializer(ambassador).data
        }, status=status.HTTP_201_CREATED)


class AmbassadorDetailView(APIView):
    def put(self, request, id):
        ambassador = Ambassador.objects.filter(id=id).first()
        if not ambassador:
            return Response({"detail": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AmbassadorUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": "Invalid update data", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        if 'name' in data and data['name'] is not None:
            ambassador.name = data['name']
        if 'email' in data and data['email'] is not None:
            ambassador.email = data['email']
        if 'phone' in data and data['phone'] is not None:
            ambassador.phone = data['phone']
        if 'university' in data and data['university'] is not None:
            ambassador.university = data['university']
        if 'reason' in data and data['reason'] is not None:
            ambassador.reason = data['reason']
        if 'role' in data and data['role'] is not None:
            ambassador.role = data['role']
        if 'dept' in data and data['dept'] is not None:
            ambassador.dept = data['dept']
        if 'image' in data and data['image'] is not None:
            ambassador.image = data['image']
        if 'status' in data and data['status'] is not None:
            ambassador.status = data['status']

        ambassador.save()

        return Response({
            "message": "Ambassador updated successfully!",
            "application": AmbassadorSerializer(ambassador).data
        }, status=status.HTTP_200_OK)

    def patch(self, request, id):
        ambassador = Ambassador.objects.filter(id=id).first()
        if not ambassador:
            return Response({"detail": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AmbassadorStatusSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": "Valid status is required."}, status=status.HTTP_400_BAD_REQUEST)

        new_status = serializer.validated_data['status']
        ambassador.status = new_status
        ambassador.save()

        return Response({
            "message": f"Application status updated to {new_status}!",
            "application": AmbassadorSerializer(ambassador).data
        }, status=status.HTTP_200_OK)

    def delete(self, request, id):
        ambassador = Ambassador.objects.filter(id=id).first()
        if not ambassador:
            return Response({"detail": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

        serialized = AmbassadorSerializer(ambassador).data
        ambassador.delete()

        return Response({
            "message": "Application deleted successfully!",
            "application": serialized
        }, status=status.HTTP_200_OK)


class WorkReportListCreateView(APIView):
    def get(self, request):
        ambassador_email = request.query_params.get('ambassadorEmail')
        if ambassador_email:
            reports = WorkReport.objects.filter(ambassadorEmail__iexact=ambassador_email.strip()).order_by('-createdAt')
        else:
            reports = WorkReport.objects.all().order_by('-createdAt')

        return Response(WorkReportSerializer(reports, many=True).data)

    def post(self, request):
        serializer = WorkReportCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": "Invalid work report data", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        new_id = f"wr_{int(time.time() * 1000)}"
        created_at = data.get('createdAt') or datetime.now().isoformat()

        report = WorkReport.objects.create(
            id=new_id,
            ambassadorEmail=data.get('ambassadorEmail') or '',
            ambassadorName=data.get('ambassadorName') or '',
            name=data['name'].strip(),
            email=data['email'].strip(),
            phone=data['phone'].strip(),
            institution=data.get('institution') or 'Campus Member',
            status=data.get('status') or 'Pending',
            createdAt=created_at
        )

        return Response({
            "message": "Work report entry created successfully!",
            "workReport": WorkReportSerializer(report).data
        }, status=status.HTTP_201_CREATED)


class WorkReportDetailView(APIView):
    def put(self, request, id):
        report = WorkReport.objects.filter(id=id).first()
        if not report:
            return Response({"detail": "Work report entry not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = WorkReportUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": "Invalid update data", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        if 'name' in data and data['name'] is not None:
            report.name = data['name'].strip()
        if 'email' in data and data['email'] is not None:
            report.email = data['email'].strip()
        if 'phone' in data and data['phone'] is not None:
            report.phone = data['phone'].strip()
        if 'institution' in data and data['institution'] is not None:
            report.institution = data['institution'].strip()
        if 'status' in data and data['status'] is not None:
            report.status = data['status'].strip()

        report.save()

        return Response({
            "message": "Work report entry updated successfully!",
            "workReport": WorkReportSerializer(report).data
        }, status=status.HTTP_200_OK)

    def delete(self, request, id):
        report = WorkReport.objects.filter(id=id).first()
        if not report:
            return Response({"detail": "Work report entry not found."}, status=status.HTTP_404_NOT_FOUND)

        serialized = WorkReportSerializer(report).data
        report.delete()

        return Response({
            "message": "Work report entry deleted successfully!",
            "workReport": serialized
        }, status=status.HTTP_200_OK)


class WorkReportStatusView(APIView):
    def patch(self, request, id):
        return self._update_status(request, id)

    def put(self, request, id):
        return self._update_status(request, id)

    def _update_status(self, request, id):
        report = WorkReport.objects.filter(id=id).first()
        if not report:
            return Response({"detail": "Work report entry not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = WorkReportStatusSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": "Valid status is required."}, status=status.HTTP_400_BAD_REQUEST)

        new_status = serializer.validated_data['status']
        report.status = new_status
        report.save()

        return Response({
            "message": f"Work report status updated to {new_status}!",
            "workReport": WorkReportSerializer(report).data
        }, status=status.HTTP_200_OK)

import random
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import NfcOrder
from .serializers import (
    NfcOrderSerializer,
    NfcOrderCreateSerializer,
    NfcOrderStatusSerializer
)


class NfcOrderListCreateView(APIView):
    def get(self, request):
        orders = NfcOrder.objects.all().order_by('-createdAt')
        return Response(NfcOrderSerializer(orders, many=True).data)

    def post(self, request):
        serializer = NfcOrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": "Invalid order data", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        new_id = data.get('id')
        if not new_id or not str(new_id).strip():
            new_id = f"NFC-{random.randint(100000, 999999)}"

        now_str = data.get('createdAt') or datetime.now().isoformat()

        order = NfcOrder.objects.create(
            id=str(new_id).strip(),
            customerName=data['customerName'].strip(),
            customerEmail=data['customerEmail'].strip(),
            customerPhone=data['customerPhone'].strip(),
            deliveryAddress=data['deliveryAddress'].strip(),
            district=data.get('district') or 'Dhaka',
            cardVariantId=data.get('cardVariantId'),
            cardVariantName=data.get('cardVariantName'),
            customNameOnCard=data.get('customNameOnCard'),
            customRoleOnCard=data.get('customRoleOnCard'),
            customOrgOnCard=data.get('customOrgOnCard'),
            paymentMethod=data.get('paymentMethod') or 'bkash',
            trxId=data.get('trxId') or '',
            ambassadorCode=data.get('ambassadorCode') or '',
            notes=data.get('notes') or '',
            quantity=str(data.get('quantity') or '1'),
            unitPrice=str(data.get('unitPrice') or '0'),
            subtotal=str(data.get('subtotal') or '0'),
            deliveryCharge=str(data.get('deliveryCharge') or '0'),
            discountAmount=str(data.get('discountAmount') or '0'),
            grandTotal=str(data.get('grandTotal') or '0'),
            status=data.get('status') or 'Pending',
            createdAt=now_str
        )

        return Response({
            "message": "NFC order placed successfully!",
            "order": NfcOrderSerializer(order).data,
            "orderId": new_id
        }, status=status.HTTP_201_CREATED)


class NfcOrderStatusView(APIView):
    def put(self, request, order_id):
        order = NfcOrder.objects.filter(id=order_id).first()
        if not order:
            return Response({"detail": "NFC Order not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = NfcOrderStatusSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": "Valid status is required."}, status=status.HTTP_400_BAD_REQUEST)

        order.status = serializer.validated_data['status']
        order.save()

        return Response({
            "message": "Order status updated successfully!",
            "order": NfcOrderSerializer(order).data
        }, status=status.HTTP_200_OK)


class NfcOrderDetailView(APIView):
    def delete(self, request, order_id):
        order = NfcOrder.objects.filter(id=order_id).first()
        if not order:
            return Response({"detail": "NFC Order not found."}, status=status.HTTP_404_NOT_FOUND)

        serialized = NfcOrderSerializer(order).data
        order.delete()

        return Response({
            "message": "NFC order deleted successfully!",
            "order": serialized
        }, status=status.HTTP_200_OK)

from rest_framework import serializers
from .models import NfcOrder

class NfcOrderSerializer(serializers.ModelSerializer):
    _id = serializers.SerializerMethodField()

    class Meta:
        model = NfcOrder
        fields = [
            'id', '_id', 'customerName', 'customerEmail', 'customerPhone',
            'deliveryAddress', 'district', 'cardVariantId', 'cardVariantName',
            'customNameOnCard', 'customRoleOnCard', 'customOrgOnCard',
            'paymentMethod', 'trxId', 'ambassadorCode', 'notes',
            'quantity', 'unitPrice', 'subtotal', 'deliveryCharge',
            'discountAmount', 'grandTotal', 'status', 'createdAt'
        ]

    def get__id(self, obj):
        return obj.id


class NfcOrderCreateSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    customerName = serializers.CharField(max_length=255)
    customerEmail = serializers.EmailField()
    customerPhone = serializers.CharField(max_length=100)
    deliveryAddress = serializers.CharField()
    district = serializers.CharField(max_length=100, default="Dhaka", required=False)
    cardVariantId = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    cardVariantName = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    customNameOnCard = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    customRoleOnCard = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    customOrgOnCard = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    paymentMethod = serializers.CharField(max_length=100, default="bkash", required=False)
    trxId = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    ambassadorCode = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    quantity = serializers.CharField(max_length=50, default="1", required=False)
    unitPrice = serializers.CharField(max_length=50, default="0", required=False)
    subtotal = serializers.CharField(max_length=50, default="0", required=False)
    deliveryCharge = serializers.CharField(max_length=50, default="0", required=False)
    discountAmount = serializers.CharField(max_length=50, default="0", required=False)
    grandTotal = serializers.CharField(max_length=50, default="0", required=False)
    status = serializers.CharField(max_length=100, default="Pending", required=False)
    createdAt = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)


class NfcOrderStatusSerializer(serializers.Serializer):
    status = serializers.CharField(max_length=100)

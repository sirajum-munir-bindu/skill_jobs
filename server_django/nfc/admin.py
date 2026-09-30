from django.contrib import admin
from .models import NfcOrder

@admin.register(NfcOrder)
class NfcOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customerName', 'customerEmail', 'cardVariantName', 'paymentMethod', 'grandTotal', 'status', 'createdAt')
    search_fields = ('id', 'customerName', 'customerEmail', 'customerPhone', 'trxId', 'ambassadorCode')
    list_filter = ('status', 'paymentMethod', 'district')

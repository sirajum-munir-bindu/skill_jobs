from django.db import models

class NfcOrder(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    customerName = models.CharField(max_length=255)
    customerEmail = models.CharField(max_length=255, db_index=True)
    customerPhone = models.CharField(max_length=100)
    deliveryAddress = models.TextField()
    district = models.CharField(max_length=100, default='Dhaka')
    cardVariantId = models.CharField(max_length=100, blank=True, null=True)
    cardVariantName = models.CharField(max_length=255, blank=True, null=True)
    customNameOnCard = models.CharField(max_length=255, blank=True, null=True)
    customRoleOnCard = models.CharField(max_length=255, blank=True, null=True)
    customOrgOnCard = models.CharField(max_length=255, blank=True, null=True)
    paymentMethod = models.CharField(max_length=100, default='bkash')
    trxId = models.CharField(max_length=255, blank=True, null=True)
    ambassadorCode = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    quantity = models.CharField(max_length=50, default='1')
    unitPrice = models.CharField(max_length=50, default='0')
    subtotal = models.CharField(max_length=50, default='0')
    deliveryCharge = models.CharField(max_length=50, default='0')
    discountAmount = models.CharField(max_length=50, default='0')
    grandTotal = models.CharField(max_length=50, default='0')
    status = models.CharField(max_length=100, default='Pending')
    createdAt = models.CharField(max_length=100)

    class Meta:
        db_table = 'nfc_orders'
        ordering = ['-createdAt']

    def __str__(self):
        return f"NFC Order {self.id} - {self.customerName} ({self.status})"

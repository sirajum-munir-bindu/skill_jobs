from django.urls import path
from .views import (
    NfcOrderListCreateView,
    NfcOrderStatusView,
    NfcOrderDetailView
)

urlpatterns = [
    path('nfc-orders', NfcOrderListCreateView.as_view(), name='nfc-orders-list-create'),
    path('nfc-orders/<str:order_id>/status', NfcOrderStatusView.as_view(), name='nfc-orders-status'),
    path('nfc-orders/<str:order_id>', NfcOrderDetailView.as_view(), name='nfc-orders-detail'),
]

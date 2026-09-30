from django.contrib import admin
from django.urls import path, include
from api_core.views import health_check

urlpatterns = [
    path('', health_check, name='health-check'),
    path('django-admin/', admin.site.urls),
    path('api/', include('api_core.urls')),
    path('api/', include('accounts.urls')),
    path('api/', include('ambassadors.urls')),
    path('api/', include('nfc.urls')),
]

from django.urls import path
from .views import (
    EventListCreateView,
    EventDetailView,
    ConfigView,
    ContactSubmitView,
    MessageListView,
    MessageDetailView
)

urlpatterns = [
    path('events', EventListCreateView.as_view(), name='events-list-create'),
    path('events/<str:id>', EventDetailView.as_view(), name='events-detail'),
    path('configs', ConfigView.as_view(), name='configs'),
    path('contact', ContactSubmitView.as_view(), name='contact-submit'),
    path('messages', MessageListView.as_view(), name='messages-list'),
    path('messages/<str:id>', MessageDetailView.as_view(), name='messages-detail'),
]

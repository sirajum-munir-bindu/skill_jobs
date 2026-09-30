from django.urls import path
from .views import (
    AmbassadorListCreateView,
    AmbassadorApplyView,
    AmbassadorDetailView,
    WorkReportListCreateView,
    WorkReportDetailView,
    WorkReportStatusView
)

urlpatterns = [
    path('ambassadors', AmbassadorListCreateView.as_view(), name='ambassadors-list'),
    path('ambassador/apply', AmbassadorApplyView.as_view(), name='ambassador-apply'),
    path('ambassadors/<str:id>', AmbassadorDetailView.as_view(), name='ambassadors-detail'),
    path('work-reports', WorkReportListCreateView.as_view(), name='work-reports-list-create'),
    path('work-reports/<str:id>', WorkReportDetailView.as_view(), name='work-reports-detail'),
    path('work-reports/<str:id>/status', WorkReportStatusView.as_view(), name='work-reports-status'),
]

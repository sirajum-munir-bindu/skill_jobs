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
    path('ambassadors/', AmbassadorListCreateView.as_view(), name='ambassadors-list-slash'),
    path('ambassador/apply', AmbassadorApplyView.as_view(), name='ambassador-apply'),
    path('ambassador/apply/', AmbassadorApplyView.as_view(), name='ambassador-apply-slash'),
    path('ambassadors/<str:id>', AmbassadorDetailView.as_view(), name='ambassadors-detail'),
    path('ambassadors/<str:id>/', AmbassadorDetailView.as_view(), name='ambassadors-detail-slash'),
    path('work-reports', WorkReportListCreateView.as_view(), name='work-reports-list-create'),
    path('work-reports/', WorkReportListCreateView.as_view(), name='work-reports-list-create-slash'),
    path('work-reports/<str:id>', WorkReportDetailView.as_view(), name='work-reports-detail'),
    path('work-reports/<str:id>/', WorkReportDetailView.as_view(), name='work-reports-detail-slash'),
    path('work-reports/<str:id>/status', WorkReportStatusView.as_view(), name='work-reports-status'),
    path('work-reports/<str:id>/status/', WorkReportStatusView.as_view(), name='work-reports-status-slash'),
]

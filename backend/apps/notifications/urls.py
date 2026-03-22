from django.urls import path
from .views import (
    NotificationListView,
    MarkNotificationReadView,
    MarkAllNotificationsReadView,
    UnreadNotificationCountView
)


urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),
    path('read-all/', MarkAllNotificationsReadView.as_view(), name='mark-all-read'),
    path('unread-count/', UnreadNotificationCountView.as_view(), name='unread-count'),
]

from  django.urls import path
from .views import *

urlpatterns=[
    path('',BookingListView.as_view()),
    path('<int:pk>/',BookingRetreiveView.as_view()),
    path("<int:booking_id>/verify/",VerifyPaymentView.as_view()),
    path("payment/<int:booking_id>/",InitiatePaymentView.as_view()),
    path("confirm/<int:booking_id>/",BookingConfirmView.as_view()),
    path("cancel/<int:booking_id>/",BookingCancelView.as_view()),
    path("start/<int:booking_id>/",BookingStartView.as_view()),
    path("complete/<int:booking_id>/",BookingCompleteView.as_view()),
    
]
from django.shortcuts import render
from .models import Booking
from rest_framework import generics
from .serializers import BookingSerializer
# Create your views here.


class BookingListCreateView(generics.ListCreateAPIView):
    queryset=Booking.objects.all()
    serializer_class=BookingSerializer
    
    def perform_create(self, serializer):
        return serializer.save(customer=self.request.user)


class BookingRetreiveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset=Booking.objects.all()
    serializer_class=BookingSerializer
    
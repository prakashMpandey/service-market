from django.shortcuts import render
from .models import ServiceCategory,Service
from rest_framework.generics import ListAPIView,CreateAPIView,UpdateAPIView,DestroyAPIView
from .serializers import ServiceSerializer
# Create your views here.


class ServicesListView(ListAPIView):
    queryset=Service.objects.prefetch_related('category')
    serializer_class=ServiceSerializer


class ServicesCreateView(CreateAPIView):
    model=Service
    serializer_class=ServiceSerializer
    def perform_create(self, serializer):
        return serializer.save(provider=self.request.user)

class ServiceUpdateView(UpdateAPIView):
    queryset=Service.objects.all()
    serializer_class=ServiceSerializer


class ServiceDeleteView(DestroyAPIView):
    model=Service
    serializer_class=ServiceSerializer
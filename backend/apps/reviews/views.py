from django.shortcuts import render
from rest_framework.generics import ListCreateAPIView,RetrieveUpdateDestroyAPIView
from .models import Review
from .serializers import ReviewSerializer
# Create your views here.


class ReviewListCreateView(ListCreateAPIView):
    queryset=Review.objects.all()
    serializer_class=ReviewSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReviewUpdateDeleteView(RetrieveUpdateDestroyAPIView):
    queryset=Review.objects.all()
    serializer_class=ReviewSerializer

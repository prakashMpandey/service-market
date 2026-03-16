from django.shortcuts import render
from rest_framework.generics import CreateAPIView,RetrieveUpdateDestroyAPIView
from .models import Review
from .serializers import ReviewSerializer
from rest_framework.permissions import IsAuthenticated
from .permissions import isReviewOwner
# Create your views here.


class ReviewListCreateView(CreateAPIView):
    permission_classes=[IsAuthenticated]
    queryset=Review
    serializer_class=ReviewSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReviewUpdateDeleteView(RetrieveUpdateDestroyAPIView):
    queryset=Review.objects.all()
    serializer_class=ReviewSerializer
    permission_classes=[IsAuthenticated,isReviewOwner]

    

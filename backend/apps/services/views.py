from django.shortcuts import render
from .models import ServiceCategory,Service
from rest_framework.generics import ListAPIView,CreateAPIView,UpdateAPIView,DestroyAPIView,RetrieveAPIView
from .serializers import ServiceSerializer,NearbyServiceSerializer,ServiceSerializerWithReviews,CategorySerializer,CreateServiceSerializer
from rest_framework.permissions import IsAuthenticated
from apps.users.permissions import isProvider,isProviderAndOwner
from rest_framework.views import APIView
from apps.users.models import User
from .utils import boundingBox
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter,OrderingFilter
from .filters import ServiceFilter
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
# Create your views here.

class ServicesListView(ListAPIView):
    queryset=Service.objects.prefetch_related('category')[:6]
    serializer_class=ServiceSerializer
    permission_classes=[IsAuthenticated]

    @method_decorator(cache_page(60*10,key_prefix='public_list'))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class NearbyServiceList(ListAPIView):
   
    serializer_class=NearbyServiceSerializer
    permission_classes=[IsAuthenticated]
    filter_backends=[DjangoFilterBackend,SearchFilter,OrderingFilter]
    filterset_class=ServiceFilter
    search_fields=['title','category__name','description']
    ordering_fields=['price']

    latitude=None
    longitude=None
    def get_queryset(self):
         lat = float(self.request.query_params.get('lat'))
         lng = float(self.request.query_params.get('lng'))
         self.latitude=round(lat,2)
         self.longitude=round(lng,2)
         radius = float(self.request.query_params.get("radius", 10))

         min_lat, max_lat, min_lng, max_lng = boundingBox(lat, lng, radius)

         services=Service.objects.filter(
             provider__role='provider',
             provider__latitude__range=(min_lat,max_lat),
             provider__longitude__range=(min_lng,max_lng)
         ).select_related('provider','category')

         return services
    
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    def get_serializer_context(self):
        context=super().get_serializer_context()
        context['lat']=self.request.query_params.get('lat')
        context['lng']=self.request.query_params.get('lng')
        return context

class ServicesCreateView(CreateAPIView):
    model=Service
    serializer_class=CreateServiceSerializer
    permission_classes=[IsAuthenticated,isProvider]

    def perform_create(self, serializer):
        return serializer.save(provider=self.request.user)

class ServiceUpdateView(UpdateAPIView):
    queryset=Service.objects.all()
    serializer_class=ServiceSerializer
    permission_classes=[IsAuthenticated,isProviderAndOwner]

class ServiceDeleteView(DestroyAPIView):
    queryset=Service.objects.all()
    serializer_class=ServiceSerializer
    permission_classes=[IsAuthenticated,isProviderAndOwner]

class MyServiceListView(ListAPIView):
    serializer_class=ServiceSerializer
    permission_classes=[IsAuthenticated,isProvider]

    def get_queryset(self):
        return Service.objects.filter(provider=self.request.user).prefetch_related('category')
    
class RetrieveServiceView(RetrieveAPIView):
    permission_classes=[IsAuthenticated]
    queryset=Service.objects.prefetch_related('reviews__user')
    serializer_class=ServiceSerializerWithReviews
    
class CategoryListView(ListAPIView):
    permission_classes=[IsAuthenticated,isProvider]
    queryset=ServiceCategory.objects.all()
    serializer_class=CategorySerializer
    pagination_class=None
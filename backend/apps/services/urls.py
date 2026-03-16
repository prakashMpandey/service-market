from django.urls import path
from .views import *

urlpatterns = [
   path('',ServicesListView.as_view(),name='listService'),
   path('create/',ServicesCreateView.as_view(),name='createService'),
   path('update/<int:pk>/',ServiceUpdateView.as_view(),name='listService'),
   path('delete/<int:pk>/',ServiceDeleteView.as_view(),name='deleteService'),
   path('myservices/',MyServiceListView.as_view(),name='myservices'),
   path('nearby/',NearbyServiceList.as_view(),name='nearbyservices'),
   path('<int:pk>/',RetrieveServiceView.as_view(),name='getService')

]
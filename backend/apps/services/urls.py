from django.urls import path
from .views import *

urlpatterns = [
   path('',ServicesListView.as_view(),name='listService'),
   path('create/',ServicesCreateView.as_view(),name='createService'),
   path('update/<int:pk>/',ServiceUpdateView.as_view(),name='listService'),
   path('delete/<int:pk>/',ServiceDeleteView.as_view(),name='listService'),
]
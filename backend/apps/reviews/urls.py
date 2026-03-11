from django.urls import path
from .views import ReviewListCreateView,ReviewUpdateDeleteView


urlpatterns = [
    path('',ReviewListCreateView.as_view()),
    path('<int:pk>/',ReviewUpdateDeleteView.as_view())
]

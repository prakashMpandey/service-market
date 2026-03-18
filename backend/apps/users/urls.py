
from django.contrib import admin
from django.urls import path,include
from apps.users import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('signup/',views.CreateUserView.as_view()),
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/',views.LogoutView.as_view(),name='logout'),
    path('location/',views.UpdateLocationView.as_view(),name='updateView'),
    path('profile_picture/',views.AddProfilePicture,name='upload_profile_picture'),
    path('dashboard/',views.DashboardView.as_view())
]

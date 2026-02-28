from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    RegisterView, 
    LogoutView, 
    UserProfileView, 
    LocationUpdateView,
    AdminUserViewSet,
    AdminStatsView
)

router = DefaultRouter()
router.register(r'admin/users', AdminUserViewSet, basename='admin-user')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    path('profile/me/', UserProfileView.as_view(), name='profile-me'),
    path('profile/location/', LocationUpdateView.as_view(), name='profile-location'),
    
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('', include(router.urls)),
]

from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from drf_yasg.utils import swagger_auto_schema

from bookings.models import Booking
from core.permissions import IsAdminUserType
from .serializers import (
    UserSerializer, 
    LogoutSerializer, 
    ProfileSerializer, 
    LocationUpdateSerializer
)
from .models import Profile

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

    @swagger_auto_schema(
        tags=['Authentication'],
        operation_description="Register a new user (Mentor or Mentee).",
        responses={
            201: UserSerializer,
            400: "Bad Request - Invalid Input"
        }
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class LogoutView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = LogoutSerializer

    @swagger_auto_schema(
        tags=['Authentication'],
        operation_description="Blacklist the refresh token to logout user.",
        request_body=LogoutSerializer,
        responses={
            205: "Reset Content - Successfully logged out",
            400: "Bad Request - Invalid or missing token"
        }
    )
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except TokenError:
            return Response({"error": "Invalid refresh token"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:  # pylint: disable=broad-except
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ProfileSerializer

    def get_queryset(self):
        return Profile.objects.filter(user=self.request.user)  # pylint: disable=no-member

    def get_object(self):
        # Ensure profile exists (it should due to signals, but safety check)
        # Note: We haven't implemented the signal yet, so we might need get_or_create here
        # strictly for robustness if the signal isn't there.
        # But standard pattern is just get_object returning the instance.
        # If we use get_object_or_404 on the queryset filtered by user, it should work.
        obj, _ = Profile.objects.get_or_create(user=self.request.user)  # pylint: disable=no-member
        return obj

    @swagger_auto_schema(
        tags=['Profile'],
        operation_description="Retrieve or update the authenticated user's profile.",
        responses={200: ProfileSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        tags=['Profile'],
        operation_description="Update profile fields (bio, avatar, experience, location).",
        responses={200: ProfileSerializer}
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


class LocationUpdateView(generics.UpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = LocationUpdateSerializer
    http_method_names = ['patch']

    def get_object(self):
        obj, _ = Profile.objects.get_or_create(user=self.request.user)  # pylint: disable=no-member
        return obj

    @swagger_auto_schema(
        tags=['Profile'],
        operation_description="Update the user's geographical location using latitude and longitude.",
        responses={200: LocationUpdateSerializer}
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


class AdminUserViewSet(viewsets.ModelViewSet):
    # Only allow safe methods (GET) or custom post actions
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer 
    permission_classes = [IsAdminUserType]
    
    @swagger_auto_schema(operation_description="Ban a user (deactivate account)")
    @action(detail=True, methods=['post'], url_path='ban')
    def ban_user(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'status': 'User banned'})

    @swagger_auto_schema(operation_description="Unban a user (reactivate account)")
    @action(detail=True, methods=['post'], url_path='unban')
    def unban_user(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'status': 'User activated'})

class AdminStatsView(APIView):
    permission_classes = [IsAdminUserType]
    
    @swagger_auto_schema(
        tags=['Admin'],
        operation_description="Get platform statistics (users, bookings, etc).",
        responses={
            200: "Success - Returns dictionary with counts"
        }
    )
    def get(self, request):
        total_users = User.objects.count()
        total_mentors = User.objects.filter(user_type=User.UserType.MENTOR).count()
        total_mentees = User.objects.filter(user_type=User.UserType.MENTEE).count()
        total_bookings = Booking.objects.count()
        active_sessions = Booking.objects.filter(status=Booking.Status.ACCEPTED).count()
        
        return Response({
            'total_users': total_users,
            'mentors': total_mentors,
            'mentees': total_mentees,
            'total_bookings': total_bookings,
            'active_bookings': active_sessions
        })

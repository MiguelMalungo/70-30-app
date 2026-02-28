from rest_framework import permissions
from django.contrib.auth import get_user_model

User = get_user_model()

class IsAdminUserType(permissions.BasePermission):
    """
    Allows access only to users with the ADMIN user type.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.user_type == User.UserType.ADMIN)

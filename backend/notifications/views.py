from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PushSubscription, Notification
from .serializers import (
    PushSubscriptionSerializer,
    NotificationSerializer,
    SendPushSerializer,
)
from .utils import send_push_notification

User = get_user_model()


class SubscribePushView(APIView):
    """
    POST /api/push/subscribe/
    Register or update a push subscription for the authenticated user.
    Expects: { endpoint, keys: { p256dh, auth } }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # The frontend sends keys nested; flatten for the serializer.
        data = request.data.copy()
        keys = data.pop('keys', None)
        if isinstance(keys, dict):
            data['p256dh'] = keys.get('p256dh', '')
            data['auth'] = keys.get('auth', '')

        serializer = PushSubscriptionSerializer(
            data=data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UnsubscribePushView(APIView):
    """
    POST /api/push/unsubscribe/
    Deactivate a push subscription by its endpoint.
    Expects: { endpoint }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        endpoint = request.data.get('endpoint')
        if not endpoint:
            return Response(
                {'detail': 'endpoint is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        updated = PushSubscription.objects.filter(
            user=request.user, endpoint=endpoint
        ).update(active=False)
        if updated:
            return Response({'detail': 'Unsubscribed.'}, status=status.HTTP_200_OK)
        return Response(
            {'detail': 'Subscription not found.'},
            status=status.HTTP_404_NOT_FOUND,
        )


class NotificationListView(generics.ListAPIView):
    """
    GET /api/push/list/
    List the authenticated user's notifications (newest first).
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)


class NotificationMarkReadView(APIView):
    """
    POST /api/push/mark-read/
    Mark one or more notifications as read.
    Expects: { ids: [1, 2, 3] }   OR   { all: true }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        mark_all = request.data.get('all', False)
        ids = request.data.get('ids', [])

        qs = Notification.objects.filter(
            recipient=request.user, read=False
        )
        if not mark_all:
            if not ids:
                return Response(
                    {'detail': 'Provide "ids" list or "all": true.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            qs = qs.filter(id__in=ids)

        count = qs.update(read=True)
        return Response({'marked_read': count}, status=status.HTTP_200_OK)


class SendPushView(APIView):
    """
    POST /api/push/send/
    Admin-only: send a push notification to a specific user or broadcast to all.
    Expects: { title, body, url?, user_id? }
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        serializer = SendPushSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        title = data['title']
        body = data['body']
        url = data.get('url', '')
        user_id = data.get('user_id')

        if user_id:
            try:
                user = User.objects.get(pk=user_id)
            except User.DoesNotExist:
                return Response(
                    {'detail': 'User not found.'},
                    status=status.HTTP_404_NOT_FOUND,
                )
            send_push_notification(user, title, body, url)
            return Response({'detail': f'Push sent to user {user_id}.'})

        # Broadcast to all users with active subscriptions
        users = User.objects.filter(
            push_subscriptions__active=True
        ).distinct()
        count = 0
        for user in users:
            send_push_notification(user, title, body, url)
            count += 1
        return Response({'detail': f'Push sent to {count} user(s).'})

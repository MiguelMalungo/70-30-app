from rest_framework import serializers

from .models import PushSubscription, Notification


class PushSubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for creating / updating a push subscription."""

    class Meta:
        model = PushSubscription
        fields = ['id', 'endpoint', 'p256dh', 'auth', 'active', 'created_at']
        read_only_fields = ['id', 'active', 'created_at']

    def create(self, validated_data):
        """Create or re-activate an existing subscription."""
        user = self.context['request'].user
        subscription, _created = PushSubscription.objects.update_or_create(
            endpoint=validated_data['endpoint'],
            defaults={
                'user': user,
                'p256dh': validated_data['p256dh'],
                'auth': validated_data['auth'],
                'active': True,
            },
        )
        return subscription


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'body', 'url', 'read',
            'sent_push', 'created_at',
        ]
        read_only_fields = [
            'id', 'title', 'body', 'url',
            'sent_push', 'created_at',
        ]


class SendPushSerializer(serializers.Serializer):
    """Payload for the admin send-push endpoint."""
    user_id = serializers.IntegerField(required=False, help_text='Target user ID. Omit to broadcast to all.')
    title = serializers.CharField(max_length=200)
    body = serializers.CharField()
    url = serializers.CharField(max_length=500, required=False, default='')

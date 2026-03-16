from rest_framework import serializers
from django.contrib.auth import get_user_model

from chat.models import Thread, Message

User = get_user_model()


class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'user_type']
        read_only_fields = fields


class MessageSerializer(serializers.ModelSerializer):
    senderName = serializers.CharField(source='sender.username', read_only=True)
    senderId = serializers.IntegerField(source='sender.id', read_only=True)
    threadId = serializers.IntegerField(source='thread.id', read_only=True)
    time = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'threadId', 'senderId', 'senderName', 'text', 'time']
        read_only_fields = ['id', 'threadId', 'senderId', 'senderName', 'time']


class ThreadSerializer(serializers.ModelSerializer):
    participants = ParticipantSerializer(many=True, read_only=True)
    participant_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        write_only=True,
        source='participants',
    )
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = ['id', 'title', 'participants', 'participant_ids',
                  'last_message', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        if msg:
            return MessageSerializer(msg).data
        return None

    def create(self, validated_data):
        participants = validated_data.pop('participants', [])
        thread = Thread.objects.create(
            title=validated_data.get('title', ''),
        )
        # Always add the requesting user as a participant
        request = self.context.get('request')
        if request and request.user:
            thread.participants.add(request.user)
        thread.participants.add(*participants)
        return thread

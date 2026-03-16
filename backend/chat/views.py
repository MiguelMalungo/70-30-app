from rest_framework import generics, permissions, status
from rest_framework.response import Response

from chat.models import Thread, Message
from chat.serializers import ThreadSerializer, MessageSerializer


class ThreadListCreateView(generics.ListCreateAPIView):
    """
    GET  — list all threads the authenticated user participates in.
    POST — create a new thread (supply participant_ids and optional title).
    """
    serializer_class = ThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Thread.objects
            .filter(participants=self.request.user)
            .prefetch_related('participants', 'messages')
            .distinct()
            .order_by('-updated_at')
        )


class ThreadDetailView(generics.RetrieveAPIView):
    """
    GET — retrieve a single thread (only if the user is a participant).
    """
    serializer_class = ThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Thread.objects
            .filter(participants=self.request.user)
            .prefetch_related('participants', 'messages')
        )


class MessageListView(generics.ListAPIView):
    """
    GET — list messages for a thread (only if the user is a participant).
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        thread_id = self.kwargs['thread_id']
        # Ensure the user is a participant
        return (
            Message.objects
            .filter(
                thread_id=thread_id,
                thread__participants=self.request.user,
            )
            .select_related('sender', 'thread')
            .order_by('created_at')
        )

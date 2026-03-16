import json
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken

from chat.models import Thread, Message

User = get_user_model()


class ChatConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for real-time chat.

    Frontend connects to: ws://host/ws/chat/<thread_id>/
    Query string must include ?token=<JWT access token> for authentication.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.thread_id = None
        self.thread_group = None

    # ------------------------------------------------------------------
    # Connection lifecycle
    # ------------------------------------------------------------------

    async def connect(self):
        self.thread_id = self.scope['url_route']['kwargs'].get('thread_id')
        self.thread_group = f"chat_{self.thread_id}"

        # Authenticate via JWT token in query string
        self.user = await self._authenticate()
        if self.user is None:
            await self.close()
            return

        # Verify the user is a participant of this thread
        is_participant = await self._is_participant()
        if not is_participant:
            await self.close()
            return

        # Join the channel group for this thread
        await self.channel_layer.group_add(
            self.thread_group,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(self, close_code):
        if self.thread_group:
            await self.channel_layer.group_discard(
                self.thread_group,
                self.channel_name,
            )

    # ------------------------------------------------------------------
    # Incoming messages from WebSocket client
    # ------------------------------------------------------------------

    async def receive_json(self, content, **kwargs):
        msg_type = content.get('type')

        if msg_type == 'message':
            await self._handle_message(content)
        elif msg_type == 'typing':
            await self._handle_typing(content)

    # ------------------------------------------------------------------
    # Handlers
    # ------------------------------------------------------------------

    async def _handle_message(self, content):
        text = content.get('text', '').strip()
        if not text:
            return

        # Persist the message
        message = await self._save_message(text)

        # Broadcast to the thread group
        await self.channel_layer.group_send(
            self.thread_group,
            {
                'type': 'chat_message',
                'id': message.pk,
                'threadId': str(self.thread_id),
                'text': text,
                'senderId': self.user.pk,
                'senderName': self.user.username,
                'time': message.created_at.isoformat(),
            },
        )

    async def _handle_typing(self, content):
        await self.channel_layer.group_send(
            self.thread_group,
            {
                'type': 'chat_typing',
                'threadId': str(self.thread_id),
                'senderId': self.user.pk,
                'senderName': self.user.username,
            },
        )

    # ------------------------------------------------------------------
    # Group-send handlers (called by channel layer)
    # ------------------------------------------------------------------

    async def chat_message(self, event):
        """Send a message event to the WebSocket client."""
        await self.send_json({
            'type': 'message',
            'id': event['id'],
            'threadId': event['threadId'],
            'text': event['text'],
            'senderId': event['senderId'],
            'senderName': event['senderName'],
            'time': event['time'],
        })

    async def chat_typing(self, event):
        """Send a typing indicator to the WebSocket client."""
        # Don't echo typing back to the sender
        if event['senderId'] == self.user.pk:
            return
        await self.send_json({
            'type': 'typing',
            'threadId': event['threadId'],
            'senderId': event['senderId'],
            'senderName': event['senderName'],
        })

    # ------------------------------------------------------------------
    # Helpers (database access)
    # ------------------------------------------------------------------

    async def _authenticate(self):
        """Validate JWT token from query string and return the user."""
        query_string = self.scope.get('query_string', b'').decode('utf-8')
        params = parse_qs(query_string)
        token_list = params.get('token')
        if not token_list:
            return None

        token_str = token_list[0]
        try:
            access_token = AccessToken(token_str)
            user_id = access_token['user_id']
            user = await self._get_user(user_id)
            return user
        except Exception:
            return None

    @database_sync_to_async
    def _get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def _is_participant(self):
        return Thread.objects.filter(
            pk=self.thread_id,
            participants=self.user,
        ).exists()

    @database_sync_to_async
    def _save_message(self, text):
        message = Message.objects.create(
            thread_id=self.thread_id,
            sender=self.user,
            text=text,
        )
        # Touch the thread's updated_at so it bubbles up in ordering
        Thread.objects.filter(pk=self.thread_id).update(
            updated_at=message.created_at,
        )
        return message

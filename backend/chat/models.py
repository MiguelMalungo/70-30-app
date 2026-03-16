from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from core.models import TimeStampedModel


class Thread(TimeStampedModel):
    """
    A chat thread between two or more participants.
    """
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='chat_threads',
        verbose_name=_('Participants'),
    )
    title = models.CharField(
        max_length=255,
        blank=True,
        default='',
        verbose_name=_('Title'),
    )

    class Meta:
        ordering = ['-updated_at']
        verbose_name = _('Thread')
        verbose_name_plural = _('Threads')

    def __str__(self):
        return f"Thread {self.pk} — {self.title or 'Untitled'}"


class Message(TimeStampedModel):
    """
    A single message inside a thread.
    """
    thread = models.ForeignKey(
        Thread,
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name=_('Thread'),
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_messages',
        verbose_name=_('Sender'),
    )
    text = models.TextField(verbose_name=_('Text'))

    class Meta:
        ordering = ['created_at']
        verbose_name = _('Message')
        verbose_name_plural = _('Messages')

    def __str__(self):
        return f"Message {self.pk} by {self.sender_id} in thread {self.thread_id}"

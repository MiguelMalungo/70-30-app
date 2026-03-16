from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from core.models import TimeStampedModel


class PushSubscription(TimeStampedModel):
    """
    Stores a Web Push subscription for a user's browser/device.
    Each unique push endpoint maps to one subscription record.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='push_subscriptions',
        on_delete=models.CASCADE,
        verbose_name=_('User'),
    )
    endpoint = models.URLField(
        max_length=500,
        unique=True,
        verbose_name=_('Push Endpoint'),
    )
    p256dh = models.CharField(
        max_length=200,
        verbose_name=_('P256DH Key'),
    )
    auth = models.CharField(
        max_length=100,
        verbose_name=_('Auth Key'),
    )
    active = models.BooleanField(
        default=True,
        verbose_name=_('Active'),
    )

    class Meta:
        verbose_name = _('Push Subscription')
        verbose_name_plural = _('Push Subscriptions')

    def __str__(self):
        return f"PushSubscription(user={self.user_id}, active={self.active})"


class Notification(TimeStampedModel):
    """
    In-app notification record. Can optionally be delivered via web push.
    """
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='notifications',
        on_delete=models.CASCADE,
        verbose_name=_('Recipient'),
    )
    title = models.CharField(
        max_length=200,
        verbose_name=_('Title'),
    )
    body = models.TextField(
        verbose_name=_('Body'),
    )
    url = models.CharField(
        max_length=500,
        blank=True,
        default='',
        verbose_name=_('URL'),
    )
    read = models.BooleanField(
        default=False,
        verbose_name=_('Read'),
    )
    sent_push = models.BooleanField(
        default=False,
        verbose_name=_('Push Sent'),
    )

    class Meta:
        verbose_name = _('Notification')
        verbose_name_plural = _('Notifications')
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification(to={self.recipient_id}, title={self.title!r})"

import json
import logging

from django.conf import settings
from pywebpush import webpush, WebPushException

from .models import PushSubscription, Notification

logger = logging.getLogger(__name__)


def send_push_notification(user, title, body, url=''):
    """
    Send a web-push notification to all of a user's active subscriptions
    and create an in-app Notification record.

    Returns the created Notification instance.
    """
    # Create the in-app notification record
    notification = Notification.objects.create(
        recipient=user,
        title=title,
        body=body,
        url=url,
    )

    subscriptions = PushSubscription.objects.filter(user=user, active=True)
    if not subscriptions.exists():
        logger.info("No active push subscriptions for user %s", user.pk)
        return notification

    payload = json.dumps({
        'title': title,
        'body': body,
        'url': url,
    })

    vapid_private_key = getattr(settings, 'VAPID_PRIVATE_KEY', '')
    vapid_claims = getattr(settings, 'VAPID_CLAIMS', {})

    if not vapid_private_key:
        logger.warning("VAPID_PRIVATE_KEY not configured; skipping push delivery.")
        return notification

    push_sent = False
    for sub in subscriptions:
        subscription_info = {
            'endpoint': sub.endpoint,
            'keys': {
                'p256dh': sub.p256dh,
                'auth': sub.auth,
            },
        }
        try:
            webpush(
                subscription_info=subscription_info,
                data=payload,
                vapid_private_key=vapid_private_key,
                vapid_claims=vapid_claims,
            )
            push_sent = True
        except WebPushException as exc:
            response = getattr(exc, 'response', None)
            status_code = getattr(response, 'status_code', None)
            # 404 or 410 means the subscription is no longer valid
            if status_code in (404, 410):
                logger.info(
                    "Deactivating expired push subscription %s for user %s",
                    sub.pk, user.pk,
                )
                sub.active = False
                sub.save(update_fields=['active'])
            else:
                logger.error(
                    "WebPush failed for subscription %s: %s",
                    sub.pk, exc,
                )
        except Exception:  # noqa: BLE001
            logger.exception(
                "Unexpected error sending push to subscription %s", sub.pk
            )

    if push_sent:
        notification.sent_push = True
        notification.save(update_fields=['sent_push'])

    return notification

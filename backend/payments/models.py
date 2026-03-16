from django.db import models
from django.utils.translation import gettext_lazy as _

from core.models import TimeStampedModel
from bookings.models import Booking


class EscrowPayment(TimeStampedModel):
    """
    Represents an escrow payment tied to a booking.
    Funds are held (captured manually) until the service is completed,
    then released to the professional or refunded to the client.
    """

    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')        # Payment created, not yet funded
        HELD = 'HELD', _('Held')                  # Money captured, held in escrow
        RELEASED = 'RELEASED', _('Released')      # Released to professional after job done
        REFUNDED = 'REFUNDED', _('Refunded')      # Refunded to client
        DISPUTED = 'DISPUTED', _('Disputed')      # Under dispute

    objects = models.Manager()

    booking = models.OneToOneField(
        Booking,
        related_name='payment',
        on_delete=models.CASCADE,
        verbose_name=_('Booking'),
    )
    stripe_payment_intent_id = models.CharField(
        _('Stripe PaymentIntent ID'),
        max_length=255,
        blank=True,
    )
    amount = models.DecimalField(
        _('Amount'),
        max_digits=8,
        decimal_places=2,
    )
    currency = models.CharField(
        _('Currency'),
        max_length=3,
        default='eur',
    )
    status = models.CharField(
        _('Status'),
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    payment_method = models.CharField(
        _('Payment Method'),
        max_length=20,
        blank=True,
        help_text=_('card, paypal, mbway'),
    )
    paid_at = models.DateTimeField(_('Paid At'), null=True, blank=True)
    released_at = models.DateTimeField(_('Released At'), null=True, blank=True)
    refunded_at = models.DateTimeField(_('Refunded At'), null=True, blank=True)

    class Meta:
        verbose_name = _('Escrow Payment')
        verbose_name_plural = _('Escrow Payments')
        ordering = ['-created_at']

    def __str__(self):
        return (
            f"Payment {self.id} — {self.amount} {self.currency.upper()} "
            f"[{self.status}] for Booking #{self.booking_id}"
        )

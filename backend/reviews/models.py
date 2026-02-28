from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import TimeStampedModel
from bookings.models import Booking

User = get_user_model()

class Review(TimeStampedModel):
    """
    Represents a review given by a user (author) to another user (recipient)
    after a completed booking session.
    """
    booking = models.ForeignKey(Booking, related_name='reviews', on_delete=models.CASCADE)
    author = models.ForeignKey(User, related_name='reviews_written', on_delete=models.CASCADE)
    recipient = models.ForeignKey(User, related_name='reviews_received', on_delete=models.CASCADE)
    
    rating = models.PositiveSmallIntegerField(
        _("Rating"),
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text=_("Rating from 1 to 5 stars")
    )
    
    comment = models.TextField(_("Comment"), blank=True)

    class Meta:
        verbose_name = _("Review")
        verbose_name_plural = _("Reviews")
        ordering = ['-created_at']
        unique_together = ('booking', 'author')
        
    def __str__(self):
        # pylint: disable=no-member
        return f"Review {self.rating}★ for {self.recipient.username} by {self.author.username}"

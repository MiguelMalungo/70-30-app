from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from core.models import TimeStampedModel
from skills.models import Skill

User = get_user_model()

class Booking(TimeStampedModel):
    """
    Represents a session request between a Mentee and a Mentor.
    """
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        ACCEPTED = 'ACCEPTED', _('Accepted')
        REJECTED = 'REJECTED', _('Rejected')
        CANCELLED = 'CANCELLED', _('Cancelled')
        COMPLETED = 'COMPLETED', _('Completed')

    objects = models.Manager()

    mentor = models.ForeignKey(User, related_name='mentor_bookings', on_delete=models.CASCADE)
    mentee = models.ForeignKey(User, related_name='mentee_bookings', on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, related_name='bookings', on_delete=models.SET_NULL, null=True)
    
    start_time = models.DateTimeField(_("Start Time"))
    end_time = models.DateTimeField(_("End Time"))
    
    status = models.CharField(
        _("Status"),
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    note = models.TextField(_("Note"), blank=True, help_text=_("Initial message or request details"))

    class Meta:
        verbose_name = _("Booking")
        verbose_name_plural = _("Bookings")
        ordering = ['-created_at']

    def __str__(self):
        # pylint: disable=no-member 
        return f"Booking ({self.status}): {self.mentee.username} -> {self.mentor.username} for {self.skill.name if self.skill else 'Unknown'}"


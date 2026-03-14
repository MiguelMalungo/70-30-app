from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from core.models import TimeStampedModel

User = get_user_model()

class Category(TimeStampedModel):
    """
    High-level grouping for services (e.g. 'Plumbing', 'Electrical').
    """
    name = models.CharField(_("Name"), max_length=100, unique=True)
    slug = models.SlugField(_("Slug"), max_length=100, unique=True, blank=True, help_text=_("URL-friendly identifier"))
    icon = models.CharField(_("Icon"), max_length=50, blank=True, help_text=_("Icon name or URL"))
    description = models.TextField(_("Description"), blank=True, help_text=_("Category description"))

    class Meta:
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")

    objects = models.Manager()

    def __str__(self):
        return str(self.name)

class Skill(TimeStampedModel):
    """
    Specific trade or topic (e.g. 'Woodworking', 'Python').
    """
    category = models.ForeignKey(Category, related_name='skills', on_delete=models.CASCADE)
    name = models.CharField(_("Name"), max_length=100, unique=True)
    
    class Meta:
        verbose_name = _("Skill")
        verbose_name_plural = _("Skills")

    objects = models.Manager()

    def __str__(self):
        return str(self.name)

class UserSkill(TimeStampedModel):
    """
    Connects a User (usually a Mentor) to a Skill with specific details.
    """
    class Proficiency(models.TextChoices):
        BEGINNER = 'BEGINNER', _('Beginner')
        INTERMEDIATE = 'INTERMEDIATE', _('Intermediate')
        EXPERT = 'EXPERT', _('Expert')
        MASTER = 'MASTER', _('Master')

    user = models.ForeignKey(User, related_name='user_skills', on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, related_name='experts', on_delete=models.CASCADE)
    proficiency = models.CharField(
        _("Proficiency"),
        max_length=20,
        choices=Proficiency.choices,
        default=Proficiency.BEGINNER
    )
    years_of_experience = models.PositiveIntegerField(_("Years of Experience"), default=0)
    description = models.TextField(_("Description"), blank=True, help_text=_("Specific details about your experience"))

    class Meta:
        verbose_name = _("User Skill")
        verbose_name_plural = _("User Skills")
        unique_together = ('user', 'skill')

    objects = models.Manager()

    def __str__(self):
        # pylint: disable=no-member
        return f"{self.user.username} - {self.skill.name} ({self.get_proficiency_display()})"

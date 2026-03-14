try:
    from django.contrib.gis.db import models as gis_models
except (ImportError, OSError, Exception):
    from django.db import models
    gis_models = models
    
    if not hasattr(gis_models, 'PointField'):
        class MockPointField(models.TextField):
            description = "Mock PointField for missing GIS libs"
            def __init__(self, *args, **kwargs):
                kwargs.pop('srid', None)
                kwargs.pop('geography', None)
                super().__init__(*args, **kwargs)
        gis_models.PointField = MockPointField

from django.db import models
from django.utils.translation import gettext_lazy as _
from .user_models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(_("Bio"), blank=True)
    avatar = models.ImageField(_("Avatar"), upload_to='avatars/', blank=True, null=True)
    years_of_experience = models.PositiveIntegerField(
        _("Years of Experience"), 
        blank=True, 
        null=True, 
        help_text=_("Only for Mentors")
    )
    # Use gis_models.PointField which falls back to MockPointField if GIS libraries are missing
    location = gis_models.PointField(_("Location"), blank=True, null=True, geography=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    def __str__(self):
        # pylint: disable=no-member
        return f"{self.user.username}'s Profile"

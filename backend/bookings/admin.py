from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'mentee', 'mentor', 'skill', 'status', 'start_time', 'created_at')
    list_filter = ('status', 'created_at', 'start_time')
    search_fields = ('mentee__username', 'mentor__username', 'skill__name', 'note')
    ordering = ('-created_at',)


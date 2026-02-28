from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'recipient', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('author__username', 'recipient__username', 'booking__id')
    readonly_fields = ('created_at',)

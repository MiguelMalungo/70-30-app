from django.contrib import admin

from .models import PushSubscription, Notification


@admin.register(PushSubscription)
class PushSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'endpoint', 'active', 'created_at']
    list_filter = ['active', 'created_at']
    search_fields = ['user__username', 'user__email', 'endpoint']
    raw_id_fields = ['user']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['recipient', 'title', 'read', 'sent_push', 'created_at']
    list_filter = ['read', 'sent_push', 'created_at']
    search_fields = ['recipient__username', 'title', 'body']
    raw_id_fields = ['recipient']

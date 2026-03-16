from django.contrib import admin

from .models import EscrowPayment


@admin.register(EscrowPayment)
class EscrowPaymentAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'booking',
        'amount',
        'currency',
        'status',
        'payment_method',
        'paid_at',
        'released_at',
        'refunded_at',
        'created_at',
    ]
    list_filter = ['status', 'currency', 'payment_method']
    search_fields = [
        'stripe_payment_intent_id',
        'booking__mentee__username',
        'booking__mentor__username',
    ]
    readonly_fields = [
        'stripe_payment_intent_id',
        'paid_at',
        'released_at',
        'refunded_at',
        'created_at',
        'updated_at',
    ]
    raw_id_fields = ['booking']

from rest_framework import serializers

from .models import EscrowPayment


class EscrowPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EscrowPayment
        fields = [
            'id',
            'booking',
            'stripe_payment_intent_id',
            'amount',
            'currency',
            'status',
            'payment_method',
            'paid_at',
            'released_at',
            'refunded_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class CreatePaymentIntentSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(
        choices=['card', 'paypal', 'mbway'],
        default='card',
    )

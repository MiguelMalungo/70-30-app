import logging

import stripe
from django.conf import settings
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from bookings.models import Booking
from .models import EscrowPayment
from .serializers import CreatePaymentIntentSerializer, EscrowPaymentSerializer

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY


class CreatePaymentIntentView(APIView):
    """
    Create a Stripe PaymentIntent with manual capture (escrow hold).
    The client uses the returned client_secret to confirm payment on the frontend.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreatePaymentIntentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking_id = serializer.validated_data['booking_id']
        payment_method_type = serializer.validated_data.get('payment_method', 'card')

        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only the mentee (client) who owns the booking can pay
        if booking.mentee != request.user:
            return Response(
                {'error': 'You are not authorized to pay for this booking.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if booking.price is None or booking.price <= 0:
            return Response(
                {'error': 'Booking has no valid price set.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent duplicate payments
        if hasattr(booking, 'payment') and booking.payment.status in (
            EscrowPayment.Status.HELD,
            EscrowPayment.Status.RELEASED,
        ):
            return Response(
                {'error': 'Payment already exists for this booking.'},
                status=status.HTTP_409_CONFLICT,
            )

        # Convert amount to cents for Stripe
        amount_cents = int(booking.price * 100)

        # Map payment method to Stripe payment_method_types
        stripe_pm_types = ['card']
        if payment_method_type == 'paypal':
            stripe_pm_types = ['paypal']
        elif payment_method_type == 'mbway':
            # MB Way uses the 'multibanco' type in Stripe for Portugal
            stripe_pm_types = ['card']

        try:
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency='eur',
                capture_method='manual',
                payment_method_types=stripe_pm_types,
                metadata={
                    'booking_id': str(booking.id),
                    'mentee_id': str(booking.mentee_id),
                    'mentor_id': str(booking.mentor_id),
                },
            )
        except stripe.error.StripeError as e:
            logger.error('Stripe PaymentIntent creation failed: %s', str(e))
            return Response(
                {'error': 'Failed to create payment intent. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # Create or update the EscrowPayment record
        escrow, _created = EscrowPayment.objects.update_or_create(
            booking=booking,
            defaults={
                'stripe_payment_intent_id': intent.id,
                'amount': booking.price,
                'currency': 'eur',
                'status': EscrowPayment.Status.PENDING,
                'payment_method': payment_method_type,
            },
        )

        return Response(
            {
                'client_secret': intent.client_secret,
                'payment_intent_id': intent.id,
                'payment': EscrowPaymentSerializer(escrow).data,
            },
            status=status.HTTP_201_CREATED,
        )


class ConfirmPaymentView(APIView):
    """
    Called after the frontend successfully confirms the payment.
    Updates the EscrowPayment status to HELD (funds are authorized but not captured).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payment_intent_id = request.data.get('payment_intent_id')
        if not payment_intent_id:
            return Response(
                {'error': 'payment_intent_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            escrow = EscrowPayment.objects.get(
                stripe_payment_intent_id=payment_intent_id,
            )
        except EscrowPayment.DoesNotExist:
            return Response(
                {'error': 'Payment not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only the mentee can confirm
        if escrow.booking.mentee != request.user:
            return Response(
                {'error': 'You are not authorized to confirm this payment.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Verify the intent status with Stripe
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        except stripe.error.StripeError as e:
            logger.error('Stripe PaymentIntent retrieval failed: %s', str(e))
            return Response(
                {'error': 'Failed to verify payment status.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if intent.status == 'requires_capture':
            escrow.status = EscrowPayment.Status.HELD
            escrow.paid_at = timezone.now()
            escrow.save(update_fields=['status', 'paid_at', 'updated_at'])
            return Response(
                {'message': 'Payment held in escrow.', 'payment': EscrowPaymentSerializer(escrow).data},
                status=status.HTTP_200_OK,
            )
        elif intent.status == 'succeeded':
            # Already captured (shouldn't happen with manual capture, but handle it)
            escrow.status = EscrowPayment.Status.HELD
            escrow.paid_at = timezone.now()
            escrow.save(update_fields=['status', 'paid_at', 'updated_at'])
            return Response(
                {'message': 'Payment confirmed.', 'payment': EscrowPaymentSerializer(escrow).data},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {'error': f'Unexpected payment status: {intent.status}'},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ReleasePaymentView(APIView):
    """
    Capture the held payment, releasing funds to the professional.
    Only admins or the system can trigger this (e.g., after service completion).
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        if not booking_id:
            return Response(
                {'error': 'booking_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            escrow = EscrowPayment.objects.get(booking_id=booking_id)
        except EscrowPayment.DoesNotExist:
            return Response(
                {'error': 'Payment not found for this booking.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if escrow.status != EscrowPayment.Status.HELD:
            return Response(
                {'error': f'Cannot release payment with status: {escrow.status}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            stripe.PaymentIntent.capture(escrow.stripe_payment_intent_id)
        except stripe.error.StripeError as e:
            logger.error('Stripe capture failed: %s', str(e))
            return Response(
                {'error': 'Failed to capture payment. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        escrow.status = EscrowPayment.Status.RELEASED
        escrow.released_at = timezone.now()
        escrow.save(update_fields=['status', 'released_at', 'updated_at'])

        return Response(
            {'message': 'Payment released to professional.', 'payment': EscrowPaymentSerializer(escrow).data},
            status=status.HTTP_200_OK,
        )


class RefundPaymentView(APIView):
    """
    Refund the payment to the client.
    If HELD (not yet captured), cancels the PaymentIntent.
    If RELEASED (already captured), creates a refund.
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        if not booking_id:
            return Response(
                {'error': 'booking_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            escrow = EscrowPayment.objects.get(booking_id=booking_id)
        except EscrowPayment.DoesNotExist:
            return Response(
                {'error': 'Payment not found for this booking.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if escrow.status not in (
            EscrowPayment.Status.HELD,
            EscrowPayment.Status.RELEASED,
        ):
            return Response(
                {'error': f'Cannot refund payment with status: {escrow.status}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            if escrow.status == EscrowPayment.Status.HELD:
                # Not yet captured — cancel the intent to release the hold
                stripe.PaymentIntent.cancel(escrow.stripe_payment_intent_id)
            else:
                # Already captured — issue a refund
                stripe.Refund.create(payment_intent=escrow.stripe_payment_intent_id)
        except stripe.error.StripeError as e:
            logger.error('Stripe refund/cancel failed: %s', str(e))
            return Response(
                {'error': 'Failed to process refund. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        escrow.status = EscrowPayment.Status.REFUNDED
        escrow.refunded_at = timezone.now()
        escrow.save(update_fields=['status', 'refunded_at', 'updated_at'])

        return Response(
            {'message': 'Payment refunded.', 'payment': EscrowPaymentSerializer(escrow).data},
            status=status.HTTP_200_OK,
        )


class PaymentStatusView(APIView):
    """
    Get the current payment status for a booking.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        try:
            escrow = EscrowPayment.objects.select_related('booking').get(
                booking_id=booking_id,
            )
        except EscrowPayment.DoesNotExist:
            return Response(
                {'error': 'No payment found for this booking.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only mentor, mentee, or admin can view payment status
        user = request.user
        booking = escrow.booking
        if not (user == booking.mentee or user == booking.mentor or user.is_staff):
            return Response(
                {'error': 'You are not authorized to view this payment.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            EscrowPaymentSerializer(escrow).data,
            status=status.HTTP_200_OK,
        )


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    """
    Handle incoming Stripe webhook events.
    Verifies the webhook signature and processes relevant events.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
        webhook_secret = settings.STRIPE_WEBHOOK_SECRET

        if not webhook_secret:
            logger.error('STRIPE_WEBHOOK_SECRET is not configured.')
            return Response(
                {'error': 'Webhook not configured.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret,
            )
        except ValueError:
            logger.warning('Invalid webhook payload.')
            return Response(
                {'error': 'Invalid payload.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except stripe.error.SignatureVerificationError:
            logger.warning('Invalid webhook signature.')
            return Response(
                {'error': 'Invalid signature.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        event_type = event['type']
        data_object = event['data']['object']

        logger.info('Stripe webhook received: %s', event_type)

        if event_type == 'payment_intent.succeeded':
            self._handle_payment_succeeded(data_object)
        elif event_type == 'payment_intent.payment_failed':
            self._handle_payment_failed(data_object)
        elif event_type == 'charge.refunded':
            self._handle_charge_refunded(data_object)
        elif event_type == 'payment_intent.amount_capturable_updated':
            self._handle_amount_capturable(data_object)

        return Response({'status': 'ok'}, status=status.HTTP_200_OK)

    @staticmethod
    def _handle_payment_succeeded(payment_intent):
        """Payment was captured successfully."""
        pi_id = payment_intent.get('id', '')
        try:
            escrow = EscrowPayment.objects.get(stripe_payment_intent_id=pi_id)
            if escrow.status == EscrowPayment.Status.HELD:
                escrow.status = EscrowPayment.Status.RELEASED
                escrow.released_at = timezone.now()
                escrow.save(update_fields=['status', 'released_at', 'updated_at'])
                logger.info('Payment %s released via webhook.', pi_id)
        except EscrowPayment.DoesNotExist:
            logger.warning('Webhook: EscrowPayment not found for PI %s', pi_id)

    @staticmethod
    def _handle_payment_failed(payment_intent):
        """Payment authorization failed."""
        pi_id = payment_intent.get('id', '')
        try:
            escrow = EscrowPayment.objects.get(stripe_payment_intent_id=pi_id)
            escrow.status = EscrowPayment.Status.PENDING
            escrow.save(update_fields=['status', 'updated_at'])
            logger.info('Payment %s failed, reset to PENDING.', pi_id)
        except EscrowPayment.DoesNotExist:
            logger.warning('Webhook: EscrowPayment not found for PI %s', pi_id)

    @staticmethod
    def _handle_charge_refunded(charge):
        """Charge was refunded."""
        pi_id = charge.get('payment_intent', '')
        if not pi_id:
            return
        try:
            escrow = EscrowPayment.objects.get(stripe_payment_intent_id=pi_id)
            escrow.status = EscrowPayment.Status.REFUNDED
            escrow.refunded_at = timezone.now()
            escrow.save(update_fields=['status', 'refunded_at', 'updated_at'])
            logger.info('Payment %s refunded via webhook.', pi_id)
        except EscrowPayment.DoesNotExist:
            logger.warning('Webhook: EscrowPayment not found for PI %s', pi_id)

    @staticmethod
    def _handle_amount_capturable(payment_intent):
        """Funds are now held (authorized, awaiting capture)."""
        pi_id = payment_intent.get('id', '')
        try:
            escrow = EscrowPayment.objects.get(stripe_payment_intent_id=pi_id)
            if escrow.status == EscrowPayment.Status.PENDING:
                escrow.status = EscrowPayment.Status.HELD
                escrow.paid_at = timezone.now()
                escrow.save(update_fields=['status', 'paid_at', 'updated_at'])
                logger.info('Payment %s held via webhook.', pi_id)
        except EscrowPayment.DoesNotExist:
            logger.warning('Webhook: EscrowPayment not found for PI %s', pi_id)

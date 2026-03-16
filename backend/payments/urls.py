from django.urls import path

from .views import (
    CreatePaymentIntentView,
    ConfirmPaymentView,
    ReleasePaymentView,
    RefundPaymentView,
    PaymentStatusView,
    StripeWebhookView,
)

app_name = 'payments'

urlpatterns = [
    path('create-intent/', CreatePaymentIntentView.as_view(), name='create-intent'),
    path('confirm/', ConfirmPaymentView.as_view(), name='confirm'),
    path('release/', ReleasePaymentView.as_view(), name='release'),
    path('refund/', RefundPaymentView.as_view(), name='refund'),
    path('status/<int:booking_id>/', PaymentStatusView.as_view(), name='status'),
    path('webhook/', StripeWebhookView.as_view(), name='webhook'),
]

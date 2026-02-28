from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from django.db.models import Q
from .models import Booking
from .serializers import BookingSerializer

@swagger_auto_schema(tags=['Bookings'])
class BookingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing session bookings.
    
    **Status Workflow**:
    - `PENDING`: Initial state when created.
    - `ACCEPTED`: Mentor has agreed to the session.
    - `REJECTED`: Mentor has declined the request.
    - `CANCELLED`: Either party has cancelled the booking.
    - `COMPLETED`: The session has taken place.
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Return bookings where the user is either the mentor or the mentee.
        """
        user = self.request.user
        return Booking.objects.filter(Q(mentor=user) | Q(mentee=user)).order_by('-start_time')

    @swagger_auto_schema(
        operation_description="Request a new session booking. Validates self-booking, future dates, and double-bookings.",
        responses={
            status.HTTP_201_CREATED: BookingSerializer,
            status.HTTP_400_BAD_REQUEST: "Validation Error (e.g., self-booking, double-booking, past dates)"
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        """
        Automatically set the mentee to the current user.
        """
        # Ensure user is not booking themselves
        mentor = serializer.validated_data['mentor']
        if mentor == self.request.user:
            raise serializers.ValidationError("You cannot book a session with yourself.")
             
        serializer.save(
            mentee=self.request.user,
            status=Booking.Status.PENDING
        )

    @swagger_auto_schema(operation_description="Accept a booking request")
    @action(detail=True, methods=['post'], url_path='accept')
    def accept(self, request, pk=None):  # pylint: disable=unused-argument
        booking = self.get_object()
        
        # Only the MENTOR can accept
        if request.user != booking.mentor:
            return Response(
                {"detail": "Only the mentor can accept this booking."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        if booking.status != Booking.Status.PENDING:
            return Response(
                {"detail": "Booking is not pending."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        booking.status = Booking.Status.ACCEPTED
        booking.save()
        return Response(BookingSerializer(booking).data)

    @swagger_auto_schema(operation_description="Reject a booking request")
    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):  # pylint: disable=unused-argument
        booking = self.get_object()
        
        # Only the MENTOR can reject (Mentees cancel)
        if request.user != booking.mentor:
            return Response(
                {"detail": "Only the mentor can reject this booking."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        booking.status = Booking.Status.REJECTED
        booking.save()
        return Response(BookingSerializer(booking).data)

    @swagger_auto_schema(operation_description="Cancel a booking request")
    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):  # pylint: disable=unused-argument
        booking = self.get_object()
        
        # Either party can cancel
        if request.user != booking.mentor and request.user != booking.mentee:
            return Response(
                {"detail": "You do not have permission to cancel this booking."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        booking.status = Booking.Status.CANCELLED
        booking.save()
        return Response(BookingSerializer(booking).data)

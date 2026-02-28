from rest_framework import viewsets, permissions, filters, status
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
from .models import Review
from .serializers import ReviewSerializer

@swagger_auto_schema(tags=['Reviews'])
class ReviewViewSet(viewsets.ModelViewSet):
    """
    API endpoint for creating and viewing reviews for a **Booking**.
    Reviews map authors (creators) to recipients via the specific booking ID.
    Constraints ensure authentic feedback for completed sessions.
    """
    queryset = Review.objects.all().order_by('-created_at')  # pylint: disable=no-member
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['recipient', 'author', 'booking', 'rating']
    ordering_fields = ['created_at', 'rating']

    @swagger_auto_schema(
        operation_description="Create a review for a completed booking. Constraints: User must be a participant, booking must be accepted/completed, booking cannot be in the future, and only one review per user per booking is allowed.",
        responses={
            status.HTTP_201_CREATED: ReviewSerializer,
            status.HTTP_400_BAD_REQUEST: "Validation Error (e.g., not a participant, booking pending, future booking, already reviewed)"
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        # Author is set in serializer.create() from request.user
        serializer.save()

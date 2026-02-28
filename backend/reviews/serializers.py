from django.utils import timezone
from rest_framework import serializers
from .models import Review
from bookings.models import Booking

class ReviewSerializer(serializers.ModelSerializer):
    # Using 'booking' as field name, accepting ID
    booking = serializers.PrimaryKeyRelatedField(
        queryset=Booking.objects.all()
    )
    author_name = serializers.CharField(source='author.username', read_only=True)
    recipient_name = serializers.CharField(source='recipient.username', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'booking', 'author', 'author_name', 'recipient', 'recipient_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['author', 'recipient', 'created_at']

    def validate(self, attrs):
        booking = attrs['booking']
        user = self.context['request'].user
        
        # 0. Check unique constraint manually because author is read-only
        if Review.objects.filter(booking=booking, author=user).exists():  # pylint: disable=no-member
            raise serializers.ValidationError("You have already reviewed this booking.")

        # 1. Ensure user is part of the booking
        if booking.mentor != user and booking.mentee != user:
            raise serializers.ValidationError("You can only review bookings you were part of.")
            
        # 2. Ensure booking is in a valid state (ACCEPTED or COMPLETED)
        if booking.status not in [Booking.Status.ACCEPTED, Booking.Status.COMPLETED]:
            raise serializers.ValidationError("You can only review accepted or completed bookings.")
            
        # 3. Ensure booking time has started (or passed)
        if booking.start_time > timezone.now():
            raise serializers.ValidationError("You cannot review a session that hasn't started yet.")

        return attrs

    def create(self, validated_data):
        booking = validated_data['booking']
        user = self.context['request'].user
        
        # Determine recipient (the other party)
        if user == booking.mentor:
            recipient = booking.mentee
        else:
            recipient = booking.mentor
            
        validated_data['author'] = user
        validated_data['recipient'] = recipient
        
        return super().create(validated_data)

from django.utils import timezone
from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating Bookings.
    """
    mentor_name = serializers.CharField(source='mentor.username', read_only=True)
    mentee_name = serializers.CharField(source='mentee.username', read_only=True)
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    category_name = serializers.CharField(source='skill.category.name', read_only=True, default='')
    category_slug = serializers.CharField(source='skill.category.slug', read_only=True, default='')

    class Meta:
        model = Booking
        fields = [
            'id', 'mentor', 'mentor_name', 'mentee', 'mentee_name',
            'skill', 'skill_name', 'category_name', 'category_slug',
            'start_time', 'end_time',
            'status', 'note', 'address', 'price', 'created_at'
        ]
        read_only_fields = ['mentee', 'status', 'created_at']

    def validate(self, data):
        """
        Check that start is before end, booking is in future, and no conflicts.
        """
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        mentor = data.get('mentor')
        user = self.context['request'].user
        
        # 1. Basic validation
        if start_time and end_time:
            if start_time < timezone.now():
                raise serializers.ValidationError("Booking cannot be in the past.")
            
            if end_time <= start_time:
                raise serializers.ValidationError("End time must be after start time.")

        # 2. Check for conflicts
        if start_time and end_time and mentor:
            # Check if Mentor is busy (ACCEPTED status)
            mentor_conflicts = Booking.objects.filter(  # pylint: disable=no-member
                mentor=mentor,
                status=Booking.Status.ACCEPTED,
                start_time__lt=end_time,
                end_time__gt=start_time
            ).exists()
            
            if mentor_conflicts:
                raise serializers.ValidationError("The mentor is already booked for this time slot.")
                
            # Check if Mentee (User) is busy
            mentee_conflicts = Booking.objects.filter(  # pylint: disable=no-member
                mentee=user,
                status=Booking.Status.ACCEPTED,
                start_time__lt=end_time,
                end_time__gt=start_time
            ).exists()
             
            if mentee_conflicts:
                raise serializers.ValidationError("You already have a booking at this time.")

        return data

from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from bookings.models import Booking
from skills.models import Skill, Category
from bookings.serializers import BookingSerializer

User = get_user_model()

class BookingSerializerTest(TestCase):
    def setUp(self):
        # Create users
        self.mentor = User.objects.create_user(username='mentor_user', password='password123')
        self.mentee = User.objects.create_user(username='mentee_user', password='password123')
        self.other_user = User.objects.create_user(username='other_user', password='password123')

        # Create skill
        self.category = Category.objects.create(name='Technology')
        self.skill = Skill.objects.create(name='Django Development', category=self.category)
        
        # Request factory for context
        self.factory = APIRequestFactory()

        # Helper time
        self.now = timezone.now()
        # Set a future time (tomorrow at 10 AM)
        self.future_start = (self.now + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)
        self.future_end = self.future_start + timedelta(hours=1)

    def test_valid_booking_request(self):
        """Test that a valid booking request passes validation."""
        request = self.factory.get('/')
        request.user = self.mentee
        
        data = {
            'mentor': self.mentor.id,
            'skill': self.skill.id,
            'start_time': self.future_start,
            'end_time': self.future_end,
            'note': "I want to learn Django."
        }
        
        serializer = BookingSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_booking_in_past(self):
        """Test that booking in the past fails validation."""
        past_start = self.now - timedelta(hours=2)
        past_end = self.now - timedelta(hours=1)
        
        request = self.factory.get('/')
        request.user = self.mentee
        
        data = {
            'mentor': self.mentor.id,
            'skill': self.skill.id,
            'start_time': past_start,
            'end_time': past_end,
        }
        
        serializer = BookingSerializer(data=data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
        self.assertIn("Booking cannot be in the past.", str(serializer.errors['non_field_errors']))

    def test_end_time_before_start_time(self):
        """Test validation for end time being before start time."""
        request = self.factory.get('/')
        request.user = self.mentee
        
        data = {
            'mentor': self.mentor.id,
            'skill': self.skill.id,
            'start_time': self.future_end,  # Swapped
            'end_time': self.future_start,
        }
        
        serializer = BookingSerializer(data=data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
        self.assertIn("End time must be after start time.", str(serializer.errors['non_field_errors']))

    def test_mentor_conflict(self):
        """Test that validation fails if the mentor is already booked."""
        # Create an existing ACCEPTED booking for the mentor
        Booking.objects.create(
            mentor=self.mentor,
            mentee=self.other_user,
            skill=self.skill,
            start_time=self.future_start,
            end_time=self.future_end,
            status=Booking.Status.ACCEPTED
        )
        
        request = self.factory.get('/')
        request.user = self.mentee
        
        # Try to book the same slot
        data = {
            'mentor': self.mentor.id,
            'skill': self.skill.id,
            'start_time': self.future_start,
            'end_time': self.future_end,
        }
        
        serializer = BookingSerializer(data=data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn("The mentor is already booked for this time slot.", str(serializer.errors['non_field_errors']))

    def test_mentee_conflict(self):
        """Test that validation fails if the mentee (requester) is already booked."""
        # Create an existing ACCEPTED booking for the mentee (as mentee or mentor elsewhere)
        Booking.objects.create(
            mentor=self.other_user,
            mentee=self.mentee,  # Mentee is busy
            skill=self.skill,
            start_time=self.future_start,
            end_time=self.future_end,
            status=Booking.Status.ACCEPTED
        )
        
        request = self.factory.get('/')
        request.user = self.mentee
        
        # Try to book another slot at the same time
        data = {
            'mentor': self.mentor.id,
            'skill': self.skill.id,
            'start_time': self.future_start,
            'end_time': self.future_end,
        }
        
        serializer = BookingSerializer(data=data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn("You already have a booking at this time.", str(serializer.errors['non_field_errors']))

    def test_pending_booking_conflict(self):
        """
        Test that PENDING bookings do NOT cause a conflict (depending on business rule).
        Assuming only ACCEPTED bookings block the calendar.
        """
        # Create an existing PENDING booking for the mentor
        Booking.objects.create(
            mentor=self.mentor,
            mentee=self.other_user,
            skill=self.skill,
            start_time=self.future_start,
            end_time=self.future_end,
            status=Booking.Status.PENDING # Not accepted yet
        )
        
        request = self.factory.get('/')
        request.user = self.mentee
        
        # Try to book the same slot
        data = {
            'mentor': self.mentor.id,
            'skill': self.skill.id,
            'start_time': self.future_start,
            'end_time': self.future_end,
        }
        
        serializer = BookingSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), "Pending bookings should not block new requests")

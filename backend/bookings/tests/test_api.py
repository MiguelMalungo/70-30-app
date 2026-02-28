from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from bookings.models import Booking
from skills.models import Skill, Category

User = get_user_model()

class BookingAPITest(APITestCase):
    def setUp(self):
        # Create users
        self.mentor = User.objects.create_user(username='mentor_user', password='password123')
        self.mentee = User.objects.create_user(username='mentee_user', password='password123')
        self.other_user = User.objects.create_user(username='other_user', password='password123')

        # Create skill
        self.category = Category.objects.create(name='Technology')
        self.skill = Skill.objects.create(name='Django Development', category=self.category)
        
        # Helper time
        self.now = timezone.now()
        # Set a future time (tomorrow at 10 AM)
        self.future_start = (self.now + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)
        self.future_end = self.future_start + timedelta(hours=1)
        
        self.booking_data = {
            'mentor': self.mentor.id,
            'skill': self.skill.id,
            'start_time': self.future_start,
            'end_time': self.future_end,
            'note': "Please teach me Django!"
        }

    def test_create_booking_success(self):
        """Test that an authenticated user can create a booking."""
        self.client.force_authenticate(user=self.mentee)
        response = self.client.post('/api/bookings/', self.booking_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.count(), 1)
        booking = Booking.objects.first()
        self.assertEqual(booking.mentee, self.mentee)
        self.assertEqual(booking.mentor, self.mentor)
        self.assertEqual(booking.status, Booking.Status.PENDING)

    def test_create_booking_self_failure(self):
        """Test that a user cannot book themselves."""
        self.client.force_authenticate(user=self.mentor)
        data = self.booking_data.copy()
        data['mentor'] = self.mentor.id # Booking self
        
        response = self.client.post('/api/bookings/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("You cannot book a session with yourself.", str(response.data))

    def test_accept_booking_success(self):
        """Test that the mentor can accept a booking request."""
        # Create a pending booking
        booking = Booking.objects.create(
            mentor=self.mentor,
            mentee=self.mentee,
            skill=self.skill,
            start_time=self.future_start,
            end_time=self.future_end,
            status=Booking.Status.PENDING
        )
        
        self.client.force_authenticate(user=self.mentor)
        response = self.client.post(f'/api/bookings/{booking.id}/accept/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, Booking.Status.ACCEPTED)

    def test_accept_booking_permission_denied(self):
        """Test that only the mentor can accept the booking."""
        # Create a pending booking
        booking = Booking.objects.create(
            mentor=self.mentor,
            mentee=self.mentee,
            skill=self.skill,
            start_time=self.future_start,
            end_time=self.future_end,
            status=Booking.Status.PENDING
        )
        
        # Try as mentee
        self.client.force_authenticate(user=self.mentee)
        response = self.client.post(f'/api/bookings/{booking.id}/accept/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Try as unrelated user
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(f'/api/bookings/{booking.id}/accept/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND) # Not in queryset

    def test_reject_booking_success(self):
        """Test that the mentor can reject a booking request."""
        booking = Booking.objects.create(
            mentor=self.mentor,
            mentee=self.mentee,
            skill=self.skill,
            start_time=self.future_start,
            end_time=self.future_end,
            status=Booking.Status.PENDING
        )
        
        self.client.force_authenticate(user=self.mentor)
        response = self.client.post(f'/api/bookings/{booking.id}/reject/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, Booking.Status.REJECTED)

    def test_cancel_booking_success_as_mentee(self):
        """Test that the mentee (requester) can cancel their booking."""
        booking = Booking.objects.create(
            mentor=self.mentor,
            mentee=self.mentee,
            skill=self.skill,
            start_time=self.future_start,
            end_time=self.future_end,
            status=Booking.Status.PENDING
        )
        
        self.client.force_authenticate(user=self.mentee)
        response = self.client.post(f'/api/bookings/{booking.id}/cancel/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, Booking.Status.CANCELLED)

    def test_booking_conflict_api(self):
        """Test that API returns validation error for conflicting booking."""
        # Create an existing ACCEPTED booking
        Booking.objects.create(
            mentor=self.mentor,
            mentee=self.other_user,
            skill=self.skill,
            start_time=self.future_start,
            end_time=self.future_end,
            status=Booking.Status.ACCEPTED
        )
        
        self.client.force_authenticate(user=self.mentee)
        response = self.client.post('/api/bookings/', self.booking_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("The mentor is already booked for this time slot.", str(response.data))

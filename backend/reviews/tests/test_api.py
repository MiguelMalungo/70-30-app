from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from bookings.models import Booking
from reviews.models import Review
from skills.models import Skill, Category

User = get_user_model()

class ReviewAPITest(APITestCase):
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
        # Set a past time (yesterday at 10 AM)
        self.past_start = (self.now - timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)
        self.past_end = self.past_start + timedelta(hours=1)
        
        # Create a completed/accepted booking
        self.booking = Booking.objects.create(
            mentor=self.mentor,
            mentee=self.mentee,
            skill=self.skill,
            start_time=self.past_start,
            end_time=self.past_end,
            status=Booking.Status.ACCEPTED
        )
        
        self.review_data = {
            'booking': self.booking.id,
            'rating': 5,
            'comment': "Great session!"
        }

    def test_create_review_success(self):
        """Test that a participant can create a review for a completed booking."""
        self.client.force_authenticate(user=self.mentee)
        response = self.client.post('/api/reviews/', self.review_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 1)  # pylint: disable=no-member
        review = Review.objects.first()  # pylint: disable=no-member
        self.assertEqual(review.author, self.mentee)
        self.assertEqual(review.recipient, self.mentor)
        self.assertEqual(review.booking, self.booking)
        self.assertEqual(review.rating, 5)

    def test_create_review_invalid_participant(self):
        """Test that a non-participant cannot review."""
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post('/api/reviews/', self.review_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("You can only review bookings you were part of.", str(response.data))

    def test_create_review_pending_booking(self):
        """Test that a pending booking cannot be reviewed."""
        self.booking.status = Booking.Status.PENDING
        self.booking.save()
        
        self.client.force_authenticate(user=self.mentee)
        response = self.client.post('/api/reviews/', self.review_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("You can only review accepted or completed bookings.", str(response.data))

    def test_create_review_future_booking(self):
        """Test that a future booking cannot be reviewed."""
        future_start = self.now + timedelta(days=1)
        future_end = future_start + timedelta(hours=1)
        
        self.booking.start_time = future_start
        self.booking.end_time = future_end
        self.booking.save()
        
        self.client.force_authenticate(user=self.mentee)
        response = self.client.post('/api/reviews/', self.review_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("You cannot review a session that hasn't started yet.", str(response.data))

    def test_unique_review_per_booking(self):
        """Test that a user can only review a booking once."""
        self.client.force_authenticate(user=self.mentee)
        # First review
        self.client.post('/api/reviews/', self.review_data)
        
        # Second review attempt
        response = self.client.post('/api/reviews/', self.review_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("You have already reviewed this booking.", str(response.data))

    def test_both_parties_can_review(self):
        """Test that both mentor and mentee can leave separate reviews."""
        # Mentee reviews
        self.client.force_authenticate(user=self.mentee)
        self.client.post('/api/reviews/', self.review_data)
        
        # Mentor reviews
        self.client.force_authenticate(user=self.mentor)
        mentor_data = self.review_data.copy()
        mentor_data['comment'] = "Great student!"
        response = self.client.post('/api/reviews/', mentor_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 2)  # pylint: disable=no-member
        
        reviews = Review.objects.filter(booking=self.booking)  # pylint: disable=no-member
        self.assertEqual(reviews.get(author=self.mentee).recipient, self.mentor)
        self.assertEqual(reviews.get(author=self.mentor).recipient, self.mentee)

    def test_list_reviews_filter(self):
        """Test filtering reviews by recipient."""
        # Create a review for mentor
        Review.objects.create(  # pylint: disable=no-member
            booking=self.booking,
            author=self.mentee,
            recipient=self.mentor,
            rating=5,
            comment="Review 1"
        )
        
        self.client.force_authenticate(user=self.other_user) # Anyone can view usually
        response = self.client.get(f'/api/reviews/?recipient={self.mentor.id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['recipient'], self.mentor.id)

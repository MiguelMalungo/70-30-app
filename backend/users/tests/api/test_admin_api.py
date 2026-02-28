from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from bookings.models import Booking
from skills.models import Skill, Category
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class AdminAPITest(APITestCase):
    def setUp(self):
        # Create different users
        self.admin = User.objects.create_superuser(username='admin_user', password='password123', email='admin@test.com')
        # Ensure user_type is ADMIN (superuser usually is, but explicit check)
        self.admin.user_type = User.UserType.ADMIN
        self.admin.save()

        self.mentor = User.objects.create_user(username='mentor_user', password='password123')
        self.mentor.user_type = User.UserType.MENTOR
        self.mentor.save()

        self.mentee = User.objects.create_user(username='mentee_user', password='password123')
        
        # Create some data for stats
        category = Category.objects.create(name='Test Cat')
        skill = Skill.objects.create(name='Test Skill', category=category)
        
        Booking.objects.create(
            mentor=self.mentor,
            mentee=self.mentee,
            skill=skill,
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, hours=1),
            status=Booking.Status.ACCEPTED
        )

    def test_admin_stats_access(self):
        """Test that admin can access stats."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/auth/admin/stats/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_users'], 3) # Admin + Mentor + Mentee
        self.assertEqual(response.data['active_bookings'], 1)

    def test_admin_stats_permission_denied(self):
        """Test that non-admin cannot access stats."""
        self.client.force_authenticate(user=self.mentor)
        response = self.client.get('/api/auth/admin/stats/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ban_user(self):
        """Test that admin can ban a user."""
        self.client.force_authenticate(user=self.admin)
        url = f'/api/auth/admin/users/{self.mentor.id}/ban/'
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.mentor.refresh_from_db()
        self.assertFalse(self.mentor.is_active)

    def test_unban_user(self):
        """Test that admin can unban a user."""
        self.mentor.is_active = False
        self.mentor.save()
        
        self.client.force_authenticate(user=self.admin)
        url = f'/api/auth/admin/users/{self.mentor.id}/unban/'
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.mentor.refresh_from_db()
        self.assertTrue(self.mentor.is_active)

    def test_ban_user_permission_denied(self):
        """Test that non-admin cannot ban users."""
        self.client.force_authenticate(user=self.mentee)
        url = f'/api/auth/admin/users/{self.mentor.id}/ban/'
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

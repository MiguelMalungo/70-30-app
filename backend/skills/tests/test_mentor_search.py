
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from skills.models import Category, Skill, UserSkill
from users.models import Profile

# Try to import Point. If GIS libraries are missing or broken (e.g. GDAL),
# we catch both ImportError and OSError and disable GIS tests.
try:
    from django.contrib.gis.geos import Point
    HAS_GIS = True
except (ImportError, OSError):
    Point = None
    HAS_GIS = False

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def category():
    return Category.objects.create(name='Tech', icon='tech')

@pytest.fixture
def skill(category):
    return Skill.objects.create(name='Python', category=category)

@pytest.fixture
def mentor(db, skill):
    user = User.objects.create_user(username='mentor1', password='password123', user_type='MENTOR')
    # Create profile with location (e.g. New York)
    if HAS_GIS:
        # 40.7128° N, 74.0060° W
        loc = Point(-74.0060, 40.7128, srid=4326)
    else:
        loc = None
        
    Profile.objects.filter(user=user).update(location=loc, bio="Python Expert")
    UserSkill.objects.create(user=user, skill=skill, proficiency='EXPERT')
    return user

@pytest.fixture
def mentee(db):
    user = User.objects.create_user(username='mentee1', password='password123', user_type='MENTEE')
    # Create profile with location (e.g. Brooklyn, nearby)
    if HAS_GIS:
        # 40.6782° N, 73.9442° W
        loc = Point(-73.9442, 40.6782, srid=4326)
    else:
        loc = None
    Profile.objects.filter(user=user).update(location=loc)
    return user

@pytest.mark.django_db
def test_mentor_search_no_params(api_client, mentor):
    api_client.force_authenticate(user=mentor)
    url = reverse('mentor-search')
    response = api_client.get(url)
    # Should return empty list or error if skill_id missing?
    # View returns empty if skill_id missing
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 0

@pytest.mark.django_db
def test_mentor_search_by_skill(api_client, mentor, skill):
    api_client.force_authenticate(user=mentor) # authenticated user
    url = reverse('mentor-search')
    response = api_client.get(url, {'skill_id': skill.id})
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['username'] == 'mentor1'

@pytest.mark.django_db
def test_mentor_search_distance_filtering(api_client, mentor, mentee, skill):
    # This test might be skipped if GIS not available
    if not HAS_GIS:
        pytest.skip("GIS libraries not available")
        
    api_client.force_authenticate(user=mentee)
    url = reverse('mentor-search')
    
    # Distance between NY and Brooklyn is roughly 5-10km
    
    # Search with large radius
    response = api_client.get(url, {
        'skill_id': skill.id, 
        'distance_km': 20
    })
    assert len(response.data) == 1
    
    # Search with small radius
    response = api_client.get(url, {
        'skill_id': skill.id, 
        'distance_km': 1
    })
    assert len(response.data) == 0

@pytest.mark.django_db
def test_mentor_search_explicit_location(api_client, mentor, skill):
    if not HAS_GIS:
        pytest.skip("GIS libraries not available")
    
    user = User.objects.create_user(username='remote_user', password='pw')
    api_client.force_authenticate(user=user)
    
    url = reverse('mentor-search')
    
    # Search from far away (e.g. London)
    response = api_client.get(url, {
        'skill_id': skill.id, 
        'latitude': 51.5074,
        'longitude': -0.1278,
        'distance_km': 100
    })
    assert len(response.data) == 0

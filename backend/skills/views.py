# pylint: disable=no-member 

from rest_framework import viewsets, permissions, filters, generics
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import Category, Skill, UserSkill
from .serializers import CategorySerializer, SkillSerializer, UserSkillSerializer, MentorSearchSerializer
from django.core.cache import cache
from rest_framework.response import Response

@swagger_auto_schema(tags=['Categories'])
class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows categories to be viewed or edited.
    """
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

@swagger_auto_schema(tags=['Skills'])
class SkillViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows skills to be viewed or edited.
    """
    queryset = Skill.objects.all().order_by('name')
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'category__name']

@swagger_auto_schema(tags=['User Skills'])
class UserSkillViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to manage their own skills.
    Use ?user=me to filter by current user, or ?user=<id> for specific user.
    """
    serializer_class = UserSkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = UserSkill.objects.all().select_related('skill', 'skill__category', 'user')
        
        user_param = self.request.query_params.get('user')
        if user_param == 'me':
            return queryset.filter(user=self.request.user)
        elif user_param:
            return queryset.filter(user__id=user_param)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'user', 
                openapi.IN_QUERY, 
                description="Filter by user ID or 'me' for current user", 
                type=openapi.TYPE_STRING
            )
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class MentorSearchView(generics.ListAPIView):
    """
    API endpoint to search for mentors based on skill and proximity.
    """
    serializer_class = MentorSearchSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('skill_id', openapi.IN_QUERY, description="ID of the skill to search for", type=openapi.TYPE_INTEGER, required=True),
            openapi.Parameter('distance_km', openapi.IN_QUERY, description="Search radius in kilometers", type=openapi.TYPE_NUMBER),
            openapi.Parameter('latitude', openapi.IN_QUERY, description="User's latitude (optional, defaults to profile location)", type=openapi.TYPE_NUMBER),
            openapi.Parameter('longitude', openapi.IN_QUERY, description="User's longitude (optional, defaults to profile location)", type=openapi.TYPE_NUMBER),
        ]
    )
    def list(self, request, *args, **kwargs):
        skill_id = request.query_params.get('skill_id')
        distance = request.query_params.get('distance_km')
        lat = request.query_params.get('latitude')
        lon = request.query_params.get('longitude')
        
        # Resolve location for cache key consistency
        # If lat/lon provided, use them. 
        # If not, use user's profile location (if available) implies strictly personal search -> specific to user
        user_id = request.user.id if request.user.is_authenticated else 'anon'
        
        # Construct a robust cache key
        # Key format: mentor_search:skill_id:distance:lat:lon:user_id(if fallback used)
        if lat and lon:
            cache_key = f"mentor_search:{skill_id}:{distance}:{lat}:{lon}"
        else:
            # Fallback to user profile means this search is unique to this user's current location in DB
            cache_key = f"mentor_search:{skill_id}:{distance}:user:{user_id}"

        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        
        # Cache for 5 minutes
        cache.set(cache_key, response.data, timeout=300)
        
        return response

    def get(self, request, *args, **kwargs):
        # We delegate to list() which is standard for ListAPIView
        return self.list(request, *args, **kwargs)

    def get_queryset(self):
        # Import GIS functions conditionally
        try:
            from django.contrib.gis.geos import Point
            from django.contrib.gis.db.models.functions import Distance
            from django.contrib.gis.measure import D
            has_gis = True
        except (ImportError, OSError):
            has_gis = False

        skill_id = self.request.query_params.get('skill_id')
        distance_km = self.request.query_params.get('distance_km')
        lat = self.request.query_params.get('latitude')
        lon = self.request.query_params.get('longitude')
        
        if not skill_id:
            return UserSkill.objects.none()
            
        queryset = UserSkill.objects.filter(skill_id=skill_id).select_related('user', 'user__profile')
        
        if not has_gis:
            return queryset.order_by('-years_of_experience')

        # Determine reference point
        ref_location = None
        if lat and lon:
            try:
                ref_location = Point(float(lon), float(lat), srid=4326)
            except (ValueError, TypeError):
                pass
        
        if not ref_location:
            # Fallback to user's profile location
            try:
                if hasattr(self.request.user, 'profile') and self.request.user.profile.location:
                    ref_location = self.request.user.profile.location
            except Exception:  # pylint: disable=broad-except
                pass
                
        if ref_location:
            # Calculate distance
            queryset = queryset.annotate(
                distance=Distance('user__profile__location', ref_location)
            )
            
            # Filter by radius if provided
            if distance_km:
                try:
                    dist = float(distance_km)
                    queryset = queryset.filter(distance__lte=D(km=dist))
                except (ValueError, TypeError):
                    pass
            
            # Order by distance
            queryset = queryset.order_by('distance')
        else:
            # If no location context, just order by experience/proficiency
            queryset = queryset.order_by('-years_of_experience')
            
        return queryset

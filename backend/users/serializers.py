from rest_framework import serializers
from django.contrib.auth import get_user_model
try:
    from django.contrib.gis.geos import Point
except Exception:
    # Fallback for environments without GIS libs
    class Point:
        def __init__(self, x, y, srid=None):
            self.x = x
            self.y = y
            self.srid = srid
from .models import Profile

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'user_type', 'first_name', 'last_name')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            user_type=validated_data.get('user_type', User.UserType.MENTEE),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(help_text="The refresh token to blacklist")

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    
    latitude = serializers.FloatField(write_only=True, required=False)
    longitude = serializers.FloatField(write_only=True, required=False)
    location = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'bio', 'avatar', 'years_of_experience',
            'location', 'latitude', 'longitude',
            'created_at', 'updated_at'
        )
        read_only_fields = ('created_at', 'updated_at', 'location')

    def get_location(self, obj):
        if obj.location:
            return {
                'latitude': obj.location.y,
                'longitude': obj.location.x
            }
        return None

    def update(self, instance, validated_data):
        latitude = validated_data.pop('latitude', None)
        longitude = validated_data.pop('longitude', None)

        if latitude is not None and longitude is not None:
            instance.location = Point(float(longitude), float(latitude), srid=4326)
        
        return super().update(instance, validated_data)

class LocationUpdateSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(write_only=True, required=True)
    longitude = serializers.FloatField(write_only=True, required=True)

    class Meta:
        model = Profile
        fields = ('latitude', 'longitude')

    def update(self, instance, validated_data):
        latitude = validated_data.get('latitude')
        longitude = validated_data.get('longitude')
        
        if latitude and longitude:
            instance.location = Point(float(longitude), float(latitude), srid=4326)
            instance.save()
        return instance

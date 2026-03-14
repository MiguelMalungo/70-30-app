# pylint: disable=no-member 

from rest_framework import serializers
from .models import Category, Skill, UserSkill

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'description', 'created_at', 'updated_at']

class SkillSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category', 
        write_only=True
    )
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'category_id', 'created_at', 'updated_at']

class UserSkillSerializer(serializers.ModelSerializer):
    skill_id = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(), 
        source='skill', 
        write_only=True
    )
    skill = SkillSerializer(read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    proficiency_display = serializers.CharField(source='get_proficiency_display', read_only=True)

    class Meta:
        model = UserSkill
        fields = [
            'id', 'user', 'skill', 'skill_id', 
            'proficiency', 'proficiency_display', 
            'years_of_experience', 'description', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user']

class MentorSearchSerializer(serializers.ModelSerializer):
    """
    Serializer for search results.
    Returns User info, Distance, and the specific Skill details.
    """
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    avatar = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
    distance_km = serializers.SerializerMethodField()
    
    class Meta:
        model = UserSkill
        fields = [
            'user_id', 'username', 'first_name', 'last_name', 
            'avatar', 'bio', 'distance_km', 
            'proficiency', 'years_of_experience', 'description',
            'skill_id'
        ]

    def get_avatar(self, obj):
        if hasattr(obj.user, 'profile') and obj.user.profile.avatar:
            try:
                return obj.user.profile.avatar.url
            except ValueError:
                return None
        return None

    def get_bio(self, obj):
        if hasattr(obj.user, 'profile'):
            return obj.user.profile.bio
        return ""

    def get_distance_km(self, obj):
        if hasattr(obj, 'distance') and obj.distance is not None:
            try:
                return round(obj.distance.km, 1)
            except AttributeError:
                return None
        return None

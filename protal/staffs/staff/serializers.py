from rest_framework import serializers
from django.contrib.auth.models import User
from .models import StaffProfile, ClassGroup, StaffAttendance, Assessment, Event
from students.stud_details.serializers import CourseSerializer


def clean_required_text(value, field, minimum=1):
    value = (value or '').strip()
    if len(value) < minimum:
        raise serializers.ValidationError(f'{field} must contain at least {minimum} character{"s" if minimum != 1 else ""}.')
    return value


class StaffProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email     = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model  = StaffProfile
        fields = ['id', 'user', 'full_name', 'email', 'department', 'phone', 'designation', 'is_active', 'created_at']
        read_only_fields = ['created_at']

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class ClassGroupSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()

    class Meta:
        model  = ClassGroup
        fields = ['id', 'code', 'name', 'semester', 'class_teacher', 'student_count', 'created_at']
        read_only_fields = ['created_at']

    def get_student_count(self, obj):
        from students.stud_details.models import StudentProfile
        return StudentProfile.objects.filter(class_name=obj.code).count()

    def validate_code(self, value):
        return clean_required_text(value, 'Class code', 2).upper()

    def validate_name(self, value):
        return clean_required_text(value, 'Class name', 2)


class StaffAttendanceSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = StaffAttendance
        fields = ['id', 'staff', 'date', 'check_in', 'check_out', 'status', 'status_display', 'total_hours']


class AssessmentSerializer(serializers.ModelSerializer):
    course_name    = serializers.CharField(source='course.name', read_only=True)
    created_by_name= serializers.SerializerMethodField()

    class Meta:
        model  = Assessment
        fields = [
            'id', 'title', 'course', 'course_name', 'class_name',
            'scheduled_at', 'duration_min', 'total_marks',
            'created_by', 'created_by_name', 'created_at',
        ]
        read_only_fields = ['created_at']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None

    def validate_title(self, value):
        return clean_required_text(value, 'Assessment title', 3)

    def validate_class_name(self, value):
        return clean_required_text(value, 'Class name', 1)

    def validate_duration_min(self, value):
        if not 5 <= value <= 480:
            raise serializers.ValidationError('Duration must be between 5 and 480 minutes.')
        return value

    def validate_total_marks(self, value):
        if value <= 0:
            raise serializers.ValidationError('Total marks must be greater than zero.')
        return value


class EventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    is_past         = serializers.SerializerMethodField()

    class Meta:
        model  = Event
        fields = [
            'id', 'title', 'description', 'event_date', 'event_time',
            'location', 'audience', 'created_by', 'created_by_name',
            'is_past', 'created_at',
        ]
        read_only_fields = ['created_at']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None

    def get_is_past(self, obj):
        from django.utils import timezone
        return obj.event_date < timezone.now().date()

    def validate_title(self, value):
        return clean_required_text(value, 'Event title', 3)

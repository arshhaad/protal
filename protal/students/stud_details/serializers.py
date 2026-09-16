from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    StudentProfile, Course, StudyMaterial, ExamSchedule,
    Mark, AttendanceRecord, Session, Task, TaskSubmission,
    LeaveRequest, FeeTransaction, Notification, Ticket,
    TicketReply, ContactMessage,
)


# ── User (read-only embed) ─────────────────────────────────
class UserMinimalSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'full_name']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


# ── Student Profile ────────────────────────────────────────
class StudentProfileSerializer(serializers.ModelSerializer):
    user      = UserMinimalSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    dob_iso   = serializers.SerializerMethodField()

    class Meta:
        model  = StudentProfile
        fields = [
            'id', 'user', 'full_name', 'enroll_id', 'phone', 'dob', 'dob_iso',
            'gender', 'address', 'class_name', 'section', 'roll_no', 'semester',
            'guardian', 'guardian_phone', 'profile_pic', 'created_at', 'updated_at',
        ]
        read_only_fields = ['enroll_id', 'created_at', 'updated_at']

    def get_full_name(self, obj):
        return obj.full_name

    def get_dob_iso(self, obj):
        return obj.dob_iso


class StudentProfileUpdateSerializer(serializers.ModelSerializer):
    """Used for PATCH requests — only editable fields."""
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name  = serializers.CharField(source='user.last_name',  required=False)
    email      = serializers.EmailField(source='user.email',     required=False)

    class Meta:
        model  = StudentProfile
        fields = [
            'first_name', 'last_name', 'email',
            'phone', 'dob', 'gender', 'address',
            'guardian', 'guardian_phone', 'profile_pic',
        ]

    def update(self, instance, validated_data):
        user_data = {}
        for key in ('first_name', 'last_name', 'email'):
            val = validated_data.pop(key, None)
            if val is not None:
                user_data[key] = val

        if user_data:
            for k, v in user_data.items():
                setattr(instance.user, k, v)
            instance.user.save()

        return super().update(instance, validated_data)


# ── Course ─────────────────────────────────────────────────
class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.SerializerMethodField()
    materials_count = serializers.SerializerMethodField()

    class Meta:
        model  = Course
        fields = [
            'id', 'code', 'name', 'instructor', 'instructor_name',
            'class_name', 'credit_hours', 'is_active',
            'materials_count', 'created_at',
        ]

    def get_instructor_name(self, obj):
        if obj.instructor:
            return obj.instructor.get_full_name() or obj.instructor.username
        return None

    def get_materials_count(self, obj):
        return obj.materials.count()


# ── Study Material ─────────────────────────────────────────
class StudyMaterialSerializer(serializers.ModelSerializer):
    course_name    = serializers.CharField(source='course.name', read_only=True)
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model  = StudyMaterial
        fields = [
            'id', 'course', 'course_name', 'title', 'file',
            'file_size', 'download_count', 'uploaded_by',
            'uploaded_by_name', 'uploaded_at',
        ]
        read_only_fields = ['download_count', 'uploaded_at']

    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return obj.uploaded_by.get_full_name() or obj.uploaded_by.username
        return None


# ── Exam Schedule ──────────────────────────────────────────
class ExamScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ExamSchedule
        fields = ['id', 'class_name', 'exam_name', 'subject', 'exam_date', 'exam_time', 'venue', 'created_at']


# ── Mark ───────────────────────────────────────────────────
class MarkSerializer(serializers.ModelSerializer):
    percentage = serializers.SerializerMethodField()

    class Meta:
        model  = Mark
        fields = ['id', 'student', 'subject', 'max_marks', 'scored', 'grade', 'term', 'percentage', 'recorded_at']
        read_only_fields = ['recorded_at']

    def get_percentage(self, obj):
        return obj.percentage


# ── Attendance ─────────────────────────────────────────────
class AttendanceRecordSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = AttendanceRecord
        fields = ['id', 'student', 'date', 'subject', 'status', 'status_display', 'remarks', 'marked_by', 'created_at']
        read_only_fields = ['created_at']


# ── Session ────────────────────────────────────────────────
class SessionSerializer(serializers.ModelSerializer):
    course_name    = serializers.CharField(source='course.name', read_only=True)
    created_by_name= serializers.SerializerMethodField()

    class Meta:
        model  = Session
        fields = [
            'id', 'course', 'course_name', 'title', 'class_name',
            'session_date', 'session_time', 'duration_min',
            'platform', 'recording', 'created_by', 'created_by_name', 'created_at',
        ]
        read_only_fields = ['created_at']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None


# ── Task ───────────────────────────────────────────────────
class TaskSerializer(serializers.ModelSerializer):
    assigned_by_name = serializers.SerializerMethodField()

    class Meta:
        model  = Task
        fields = ['id', 'title', 'subject', 'class_name', 'description', 'due_date', 'assigned_by', 'assigned_by_name', 'created_at']
        read_only_fields = ['created_at']

    def get_assigned_by_name(self, obj):
        if obj.assigned_by:
            return obj.assigned_by.get_full_name() or obj.assigned_by.username
        return None


# ── Task Submission ────────────────────────────────────────
class TaskSubmissionSerializer(serializers.ModelSerializer):
    task_title      = serializers.CharField(source='task.title', read_only=True)
    student_name    = serializers.SerializerMethodField()
    status          = serializers.SerializerMethodField()
    reviewed_by_name= serializers.SerializerMethodField()

    class Meta:
        model  = TaskSubmission
        fields = [
            'id', 'task', 'task_title', 'student', 'student_name',
            'file', 'notes', 'submitted_at', 'grade', 'feedback',
            'reviewed_by', 'reviewed_by_name', 'reviewed_at', 'status',
        ]
        read_only_fields = ['submitted_at', 'reviewed_at']

    def get_student_name(self, obj):
        return obj.student.full_name

    def get_status(self, obj):
        return obj.status

    def get_reviewed_by_name(self, obj):
        if obj.reviewed_by:
            return obj.reviewed_by.get_full_name() or obj.reviewed_by.username
        return None


# ── Leave Request ──────────────────────────────────────────
class LeaveRequestSerializer(serializers.ModelSerializer):
    duration = serializers.SerializerMethodField()

    class Meta:
        model  = LeaveRequest
        fields = [
            'id', 'student', 'leave_type', 'from_date', 'to_date',
            'reason', 'status', 'reviewed_by', 'applied_at', 'updated_at', 'duration',
        ]
        read_only_fields = ['status', 'reviewed_by', 'applied_at', 'updated_at']

    def get_duration(self, obj):
        return obj.duration


# ── Fee Transaction ────────────────────────────────────────
class FeeTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = FeeTransaction
        fields = ['id', 'student', 'description', 'amount', 'due_date', 'paid_date', 'status', 'recorded_by', 'created_at']
        read_only_fields = ['created_at']


# ── Notification ───────────────────────────────────────────
class NotificationSerializer(serializers.ModelSerializer):
    sent_by_name = serializers.SerializerMethodField()

    class Meta:
        model  = Notification
        fields = ['id', 'recipient', 'title', 'body', 'is_read', 'is_important', 'sent_by', 'sent_by_name', 'created_at']
        read_only_fields = ['created_at']

    def get_sent_by_name(self, obj):
        if obj.sent_by:
            return obj.sent_by.get_full_name() or obj.sent_by.username
        return None


# ── Ticket Reply ───────────────────────────────────────────
class TicketReplySerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model  = TicketReply
        fields = ['id', 'ticket', 'author', 'author_name', 'message', 'created_at']
        read_only_fields = ['created_at']

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username


# ── Ticket ─────────────────────────────────────────────────
class TicketSerializer(serializers.ModelSerializer):
    replies      = TicketReplySerializer(many=True, read_only=True)
    student_name = serializers.SerializerMethodField()

    class Meta:
        model  = Ticket
        fields = [
            'id', 'student', 'student_name', 'category', 'subject', 'description',
            'status', 'assigned_to', 'replies', 'created_at', 'updated_at',
        ]
        read_only_fields = ['status', 'created_at', 'updated_at']

    def get_student_name(self, obj):
        return obj.student.full_name


# ── Contact Message ────────────────────────────────────────
class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ContactMessage
        fields = ['id', 'student', 'department', 'subject', 'message', 'sent_at']
        read_only_fields = ['sent_at']

from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Avg
from django.utils import timezone
from .models import (
    StudentProfile, Course, StudyMaterial, ExamSchedule,
    Mark, AttendanceRecord, Session, Task, TaskSubmission,
    LeaveRequest, FeeTransaction, Notification, Ticket,
    TicketReply, ContactMessage,
)


def clean_required_text(value, field, minimum=1):
    """Return trimmed text or a consistent API validation error."""
    value = (value or '').strip()
    if len(value) < minimum:
        raise serializers.ValidationError(f'{field} must contain at least {minimum} character{"s" if minimum != 1 else ""}.')
    return value


def validate_phone(value, field='Phone number'):
    value = (value or '').strip()
    if not value:
        return value
    digits = ''.join(char for char in value if char.isdigit())
    if len(digits) < 10 or len(digits) > 15:
        raise serializers.ValidationError(f'{field} must contain 10 to 15 digits.')
    return value


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
    academic_progress = serializers.SerializerMethodField()

    class Meta:
        model  = StudentProfile
        fields = [
            'id', 'user', 'full_name', 'enroll_id', 'phone', 'dob', 'dob_iso',
            'gender', 'address', 'class_name', 'section', 'roll_no', 'semester',
            'guardian', 'guardian_phone', 'profile_pic', 'academic_progress',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['enroll_id', 'created_at', 'updated_at']

    def get_full_name(self, obj):
        return obj.full_name

    def get_dob_iso(self, obj):
        return obj.dob_iso

    def get_academic_progress(self, obj):
        marks = obj.marks.all()
        average = marks.aggregate(value=Avg('scored'))['value']
        return {
            'average_marks': round(float(average), 1) if average is not None else 0,
            'subjects_recorded': marks.count(),
        }


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

    def validate_first_name(self, value):
        return clean_required_text(value, 'First name', 2)

    def validate_last_name(self, value):
        return clean_required_text(value, 'Last name', 2)

    def validate_phone(self, value):
        return validate_phone(value)

    def validate_guardian_phone(self, value):
        return validate_phone(value, 'Guardian phone number')

    def validate_dob(self, value):
        if value and value >= timezone.localdate():
            raise serializers.ValidationError('Date of birth must be in the past.')
        return value

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

    def validate_code(self, value):
        return clean_required_text(value, 'Course code', 2).upper()

    def validate_name(self, value):
        return clean_required_text(value, 'Course name', 2)

    def validate_credit_hours(self, value):
        if not 1 <= value <= 12:
            raise serializers.ValidationError('Credit hours must be between 1 and 12.')
        return value


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

    def validate_title(self, value):
        return clean_required_text(value, 'Title', 3)

    def validate_file(self, value):
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError('File size must not exceed 10 MB.')
        return value


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

    def validate(self, attrs):
        max_marks = attrs.get('max_marks', getattr(self.instance, 'max_marks', None))
        scored = attrs.get('scored', getattr(self.instance, 'scored', None))
        if max_marks is not None and max_marks <= 0:
            raise serializers.ValidationError({'max_marks': 'Maximum marks must be greater than zero.'})
        if max_marks is not None and scored is not None and scored > max_marks:
            raise serializers.ValidationError({'scored': 'Scored marks cannot exceed maximum marks.'})
        return attrs


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

    def validate_title(self, value):
        return clean_required_text(value, 'Session title', 3)

    def validate_class_name(self, value):
        return clean_required_text(value, 'Class name', 1)

    def validate_duration_min(self, value):
        if not 5 <= value <= 480:
            raise serializers.ValidationError('Duration must be between 5 and 480 minutes.')
        return value


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

    def validate_title(self, value):
        return clean_required_text(value, 'Task title', 3)

    def validate_subject(self, value):
        return clean_required_text(value, 'Subject', 2)

    def validate_class_name(self, value):
        return clean_required_text(value, 'Class name', 1)


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

    def validate(self, attrs):
        notes = (attrs.get('notes') or '').strip()
        if not attrs.get('file') and len(notes) < 3:
            raise serializers.ValidationError('Attach a file or enter submission notes of at least 3 characters.')
        return attrs


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

    def validate_leave_type(self, value):
        normalized = value.strip().lower().replace(' leave', '').replace(' function', '')
        aliases = {'medical': 'medical', 'sick': 'sick', 'family event': 'family', 'family': 'family', 'personal': 'personal'}
        if normalized not in aliases:
            raise serializers.ValidationError('Select a valid leave type.')
        return aliases[normalized]

    def validate(self, attrs):
        start = attrs.get('from_date', getattr(self.instance, 'from_date', None))
        end = attrs.get('to_date', getattr(self.instance, 'to_date', None))
        if start and end and end < start:
            raise serializers.ValidationError({'to_date': 'To date cannot be earlier than from date.'})
        if 'reason' in attrs:
            attrs['reason'] = clean_required_text(attrs['reason'], 'Reason', 10)
        return attrs


# ── Fee Transaction ────────────────────────────────────────
class FeeTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = FeeTransaction
        fields = ['id', 'student', 'description', 'amount', 'due_date', 'paid_date', 'status', 'recorded_by', 'created_at']
        read_only_fields = ['created_at']

    def validate_description(self, value):
        return clean_required_text(value, 'Description', 3)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be greater than zero.')
        return value

    def validate(self, attrs):
        status = attrs.get('status', getattr(self.instance, 'status', None))
        paid_date = attrs.get('paid_date', getattr(self.instance, 'paid_date', None))
        if status == 'paid' and not paid_date:
            raise serializers.ValidationError({'paid_date': 'A paid transaction requires a paid date.'})
        return attrs


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

    def validate_message(self, value):
        return clean_required_text(value, 'Reply', 2)


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

    def validate_category(self, value):
        aliases = {
            'academic': 'academic', 'finance': 'finance', 'library': 'library',
            'it support': 'it', 'it': 'it', 'other': 'other',
        }
        normalized = value.strip().lower()
        if normalized not in aliases:
            raise serializers.ValidationError('Select a valid ticket category.')
        return aliases[normalized]

    def validate_subject(self, value):
        return clean_required_text(value, 'Subject', 3)

    def validate_description(self, value):
        return clean_required_text(value, 'Description', 10)


# ── Contact Message ────────────────────────────────────────
class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ContactMessage
        fields = ['id', 'student', 'department', 'subject', 'message', 'sent_at']
        read_only_fields = ['sent_at']

    def validate_department(self, value):
        aliases = {
            'academic office': 'academic', 'academic': 'academic',
            'finance department': 'finance', 'finance': 'finance',
            'library': 'library', 'it support': 'it', 'it': 'it',
            "principal's office": 'principal', 'principal': 'principal',
        }
        normalized = value.strip().lower()
        if normalized not in aliases:
            raise serializers.ValidationError('Select a valid department.')
        return aliases[normalized]

    def validate_subject(self, value):
        return clean_required_text(value, 'Subject', 3)

    def validate_message(self, value):
        return clean_required_text(value, 'Message', 10)

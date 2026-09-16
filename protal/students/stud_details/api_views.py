from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Avg, Count, Q

from .models import (
    StudentProfile, Course, StudyMaterial, ExamSchedule, Mark,
    AttendanceRecord, Session, Task, TaskSubmission, LeaveRequest,
    FeeTransaction, Notification, Ticket, TicketReply, ContactMessage,
)
from .serializers import (
    StudentProfileSerializer, StudentProfileUpdateSerializer,
    CourseSerializer, StudyMaterialSerializer, ExamScheduleSerializer,
    MarkSerializer, AttendanceRecordSerializer, SessionSerializer,
    TaskSerializer, TaskSubmissionSerializer, LeaveRequestSerializer,
    FeeTransactionSerializer, NotificationSerializer,
    TicketSerializer, TicketReplySerializer, ContactMessageSerializer,
)
from .permissions import IsStudent, IsOwnerStudent, IsStaffMember, IsAdminUser
from students.auth_stud.serializers import (
    StudentLoginSerializer, ForgotPasswordSerializer, ResetPasswordSerializer,
)

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes


# ════════════════════════════════════════════
# AUTH
# ════════════════════════════════════════════

class StudentLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = StudentLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user  = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        profile  = user.student_profile
        return Response({
            'token':     token.key,
            'enroll_id': profile.enroll_id,
            'full_name': profile.full_name,
            'class_name':profile.class_name,
            'semester':  profile.semester,
        })


class StudentLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response({'detail': 'Logged out.'}, status=status.HTTP_200_OK)


class StudentForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get('identifier', '').strip()
        # Silently succeed whether or not user exists (prevent enumeration)
        try:
            profile = StudentProfile.objects.get(enroll_id=identifier)
            user    = profile.user
            uid     = urlsafe_base64_encode(force_bytes(user.pk))
            token   = default_token_generator.make_token(user)
            # TODO: send email with reset link containing uid+token
        except StudentProfile.DoesNotExist:
            pass
        return Response({'detail': 'If the Enrollment ID is registered, reset instructions have been sent.'})


class StudentResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        Token.objects.filter(user=user).delete()
        return Response({'detail': 'Password reset successfully.'})


# ════════════════════════════════════════════
# STUDENT PROFILE
# ════════════════════════════════════════════

class StudentProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH own profile."""
    permission_classes = [IsAuthenticated, IsStudent]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return StudentProfileUpdateSerializer
        return StudentProfileSerializer

    def get_object(self):
        return self.request.user.student_profile


# ════════════════════════════════════════════
# COURSES & STUDY MATERIALS
# ════════════════════════════════════════════

class StudentCourseListView(generics.ListAPIView):
    """Courses for the student's class."""
    serializer_class   = CourseSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        profile = self.request.user.student_profile
        return Course.objects.filter(
            class_name=profile.class_name, is_active=True
        ).select_related('instructor')


class StudentMaterialListView(generics.ListAPIView):
    """Study materials for the student's class courses."""
    serializer_class   = StudyMaterialSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        profile = self.request.user.student_profile
        course_ids = Course.objects.filter(class_name=profile.class_name).values_list('id', flat=True)
        return StudyMaterial.objects.filter(course__in=course_ids)

    def retrieve(self, request, *args, **kwargs):
        """Increment download count on file access."""
        instance = self.get_object()
        StudyMaterial.objects.filter(pk=instance.pk).update(download_count=instance.download_count + 1)
        return super().retrieve(request, *args, **kwargs)


# ════════════════════════════════════════════
# EXAMS
# ════════════════════════════════════════════

class StudentExamListView(generics.ListAPIView):
    serializer_class   = ExamScheduleSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        profile = self.request.user.student_profile
        return ExamSchedule.objects.filter(class_name=profile.class_name).order_by('exam_date')


# ════════════════════════════════════════════
# MARKS
# ════════════════════════════════════════════

class StudentMarkListView(generics.ListAPIView):
    serializer_class   = MarkSerializer
    permission_classes = [IsAuthenticated, IsStudent]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['subject', 'term']

    def get_queryset(self):
        profile = self.request.user.student_profile
        return Mark.objects.filter(student=profile)

    def list(self, request, *args, **kwargs):
        qs       = self.get_queryset()
        serializer = self.get_serializer(qs, many=True)
        # compute summary
        avg_pct  = qs.aggregate(avg=Avg('scored'))['avg'] or 0
        return Response({
            'marks':       serializer.data,
            'avg_percentage': round(avg_pct, 1),
            'total_subjects': qs.count(),
        })


# ════════════════════════════════════════════
# ATTENDANCE
# ════════════════════════════════════════════

class StudentAttendanceView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        profile = request.user.student_profile
        records = AttendanceRecord.objects.filter(student=profile).order_by('-date')

        total   = records.count()
        present = records.filter(status='P').count()
        absent  = records.filter(status='A').count()
        late    = records.filter(status='T').count()
        leave   = records.filter(status='L').count()
        pct     = round((present / total * 100), 1) if total else 0

        serializer = AttendanceRecordSerializer(records, many=True)
        return Response({
            'attendance_pct':  pct,
            'present_days':    present,
            'absent_days':     absent,
            'late_days':       late,
            'leave_days':      leave,
            'total_days':      total,
            'log':             serializer.data,
        })


# ════════════════════════════════════════════
# SESSIONS
# ════════════════════════════════════════════

class StudentSessionListView(generics.ListAPIView):
    serializer_class   = SessionSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        profile = self.request.user.student_profile
        return Session.objects.filter(class_name=profile.class_name).select_related('course', 'created_by')


# ════════════════════════════════════════════
# TASKS
# ════════════════════════════════════════════

class StudentTaskListView(generics.ListAPIView):
    serializer_class   = TaskSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        profile = self.request.user.student_profile
        return Task.objects.filter(class_name=profile.class_name)


class StudentTaskSubmitView(generics.CreateAPIView):
    serializer_class   = TaskSubmissionSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user.student_profile)


class StudentSubmissionListView(generics.ListAPIView):
    serializer_class   = TaskSubmissionSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        profile = self.request.user.student_profile
        return TaskSubmission.objects.filter(student=profile).select_related('task')


# ════════════════════════════════════════════
# LEAVE REQUESTS
# ════════════════════════════════════════════

class StudentLeaveRequestView(generics.ListCreateAPIView):
    serializer_class   = LeaveRequestSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        return LeaveRequest.objects.filter(student=self.request.user.student_profile)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user.student_profile, status='pending')


# ════════════════════════════════════════════
# PAYMENTS
# ════════════════════════════════════════════

class StudentPaymentView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        profile = request.user.student_profile
        txns    = FeeTransaction.objects.filter(student=profile)
        total   = sum(t.amount for t in txns)
        paid    = sum(t.amount for t in txns if t.status == 'paid')
        pending = total - paid
        serializer = FeeTransactionSerializer(txns, many=True)
        return Response({
            'total_fees':  total,
            'amount_paid': paid,
            'outstanding': pending,
            'transactions': serializer.data,
        })


# ════════════════════════════════════════════
# NOTIFICATIONS
# ════════════════════════════════════════════

class StudentNotificationListView(generics.ListAPIView):
    serializer_class   = NotificationSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')


class StudentNotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def patch(self, request, pk):
        try:
            notif = Notification.objects.get(pk=pk, recipient=request.user)
        except Notification.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)
        notif.is_read = True
        notif.save()
        return Response({'detail': 'Marked as read.'})

    def delete(self, request):
        """Mark all as read."""
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'detail': 'All notifications marked as read.'})


# ════════════════════════════════════════════
# TICKETS
# ════════════════════════════════════════════

class StudentTicketView(generics.ListCreateAPIView):
    serializer_class   = TicketSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        return Ticket.objects.filter(student=self.request.user.student_profile).prefetch_related('replies')

    def perform_create(self, serializer):
        serializer.save(student=self.request.user.student_profile, status='open')


# ════════════════════════════════════════════
# CONTACT US
# ════════════════════════════════════════════

class StudentContactView(generics.CreateAPIView):
    serializer_class   = ContactMessageSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user.student_profile)


# ════════════════════════════════════════════
# DASHBOARD SUMMARY
# ════════════════════════════════════════════

class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        profile = request.user.student_profile

        # Attendance
        att_records = AttendanceRecord.objects.filter(student=profile)
        total   = att_records.count()
        present = att_records.filter(status='P').count()
        att_pct = round(present / total * 100, 1) if total else 0

        # Marks avg
        marks   = Mark.objects.filter(student=profile)
        avg_marks = round(
            sum(m.percentage for m in marks) / marks.count(), 1
        ) if marks.count() else 0

        # Pending tasks
        pending_tasks = Task.objects.filter(class_name=profile.class_name).exclude(
            submissions__student=profile
        ).count()

        # Due fees
        due_amount = sum(
            t.amount for t in FeeTransaction.objects.filter(student=profile, status='pending')
        )

        # Unread notifications
        unread_notifs = Notification.objects.filter(recipient=request.user, is_read=False).count()

        return Response({
            'student': {
                'full_name':  profile.full_name,
                'enroll_id':  profile.enroll_id,
                'class_name': profile.class_name,
                'semester':   profile.semester,
            },
            'stats': {
                'attendance_pct':    att_pct,
                'avg_marks':         avg_marks,
                'pending_tasks':     pending_tasks,
                'due_amount':        str(due_amount),
                'unread_notifications': unread_notifs,
            },
        })

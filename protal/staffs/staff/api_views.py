from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import StaffProfile, ClassGroup, StaffAttendance, Assessment, Event
from .serializers import (
    StaffProfileSerializer, ClassGroupSerializer,
    StaffAttendanceSerializer, AssessmentSerializer, EventSerializer,
)
from students.stud_details.models import (
    StudentProfile, Course, StudyMaterial, Session,
    Task, TaskSubmission, Ticket, TicketReply, Notification,
    AttendanceRecord, LeaveRequest,
)
from students.stud_details.serializers import (
    CourseSerializer, StudyMaterialSerializer, SessionSerializer,
    TaskSerializer, TaskSubmissionSerializer, TicketSerializer,
    TicketReplySerializer, NotificationSerializer,
    AttendanceRecordSerializer, StudentProfileSerializer, LeaveRequestSerializer,
)
from students.stud_details.permissions import IsStaffMember, IsAdminUser
from students.auth_stud.serializers import (
    StaffLoginSerializer,
    StaffSignupSerializer,
    ResetPasswordSerializer,
)

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes


# ════════════════════════════════════════════
# STAFF AUTH
# ════════════════════════════════════════════

class StaffLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = StaffLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user  = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)

        profile_data = {}
        if hasattr(user, 'staff_profile'):
            p = user.staff_profile
            profile_data = {'department': p.department, 'designation': p.designation}

        return Response({
            'token':      token.key,
            'username':   user.username,
            'full_name':  user.get_full_name() or user.username,
            'email':      user.email,
            'is_admin':   user.is_superuser,
            **profile_data,
        })


class StaffLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response({'detail': 'Logged out.'})


class StaffSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = StaffSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        StaffProfile.objects.create(
            user=user,
            department=request.data.get('department', '').strip(),
            designation=request.data.get('designation', 'Lecturer').strip(),
            phone=request.data.get('phone', '').strip(),
        )
        return Response(
            {'detail': 'Signup successful. Please login to continue.'},
            status=status.HTTP_201_CREATED,
        )


class StaffForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        try:
            user  = User.objects.get(email=email, is_staff=True)
            uid   = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            # TODO: send email
        except User.DoesNotExist:
            pass
        return Response({'detail': 'If the email is registered, reset instructions have been sent.'})


class StaffResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        Token.objects.filter(user=user).delete()
        return Response({'detail': 'Password updated.'})


# ════════════════════════════════════════════
# STAFF DASHBOARD
# ════════════════════════════════════════════

class StaffDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsStaffMember]

    def get(self, request):
        today = timezone.now().date()

        total_students = StudentProfile.objects.count()
        active_courses = Course.objects.filter(is_active=True).count()
        pending_reviews = TaskSubmission.objects.filter(grade='').count()
        open_tickets   = Ticket.objects.filter(status='open').count()

        today_att = AttendanceRecord.objects.filter(date=today)
        att_total   = today_att.count()
        att_present = today_att.filter(status='P').count()
        att_pct = f"{round(att_present / att_total * 100)}%" if att_total else "N/A"

        sessions_today = Session.objects.filter(
            session_date=today
        ).select_related('course').values(
            'title', 'course__name', 'session_time', 'platform', 'class_name'
        )[:5]

        return Response({
            'stats': {
                'total_students':   total_students,
                'active_courses':   active_courses,
                'attendance_today': att_pct,
                'pending_reviews':  pending_reviews,
                'open_tickets':     open_tickets,
            },
            'sessions_today': list(sessions_today),
        })


# ════════════════════════════════════════════
# COURSES
# ════════════════════════════════════════════

class StaffCourseListView(generics.ListAPIView):
    serializer_class   = CourseSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]

    def get_queryset(self):
        return Course.objects.filter(instructor=self.request.user, is_active=True)


# ════════════════════════════════════════════
# STUDY MATERIALS
# ════════════════════════════════════════════

class StaffMaterialListCreateView(generics.ListCreateAPIView):
    serializer_class   = StudyMaterialSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]

    def get_queryset(self):
        return StudyMaterial.objects.filter(uploaded_by=self.request.user).select_related('course')

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user, download_count=0)


class StaffMaterialDetailView(generics.RetrieveDestroyAPIView):
    serializer_class   = StudyMaterialSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]

    def get_queryset(self):
        return StudyMaterial.objects.filter(uploaded_by=self.request.user)


# ════════════════════════════════════════════
# SESSIONS
# ════════════════════════════════════════════

class StaffSessionListCreateView(generics.ListCreateAPIView):
    serializer_class   = SessionSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]

    def get_queryset(self):
        return Session.objects.filter(created_by=self.request.user).select_related('course')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class StaffSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = SessionSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]

    def get_queryset(self):
        return Session.objects.filter(created_by=self.request.user)


# ════════════════════════════════════════════
# STUDENTS (view details)
# ════════════════════════════════════════════

class StaffStudentListView(generics.ListCreateAPIView):
    serializer_class   = StudentProfileSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['enroll_id', 'user__first_name', 'user__last_name', 'class_name']

    def get_queryset(self):
        return StudentProfile.objects.select_related('user').all()

    def post(self, request, *args, **kwargs):
        enroll_id  = request.data.get('enroll_id', '').strip()
        first_name = request.data.get('first_name', '').strip()
        last_name  = request.data.get('last_name', '').strip()
        email      = request.data.get('email', '').strip()
        class_name = request.data.get('class_name', '').strip()
        password   = request.data.get('password', '').strip() or 'Student@123'
        section    = request.data.get('section', '').strip()
        phone      = request.data.get('phone', '').strip()
        guardian   = request.data.get('guardian', '').strip()
        guardian_phone = request.data.get('guardian_phone', '').strip()

        if not all([enroll_id, first_name, class_name]):
            return Response({'detail': 'Enrollment ID, first name and class are required.'}, status=400)
        if len(enroll_id) < 3 or len(first_name) < 2:
            return Response({'detail': 'Enrollment ID must be at least 3 characters and first name at least 2 characters.'}, status=400)

        if not email:
            email = f"{enroll_id.lower()}@school.edu"
        try:
            validate_email(email)
        except DjangoValidationError:
            return Response({'detail': 'Enter a valid student email address.'}, status=400)

        for label, number in [('Student phone', phone), ('Guardian phone', guardian_phone)]:
            digits = ''.join(char for char in number if char.isdigit())
            if number and not 10 <= len(digits) <= 15:
                return Response({'detail': f'{label} must contain 10 to 15 digits.'}, status=400)

        if StudentProfile.objects.filter(enroll_id=enroll_id).exists():
            return Response({'detail': 'Enrollment ID already in use.'}, status=400)
        if User.objects.filter(email=email).exists() or User.objects.filter(username=enroll_id).exists():
            return Response({'detail': 'A user with this enrollment ID or email already exists.'}, status=400)

        user, created = User.objects.get_or_create(
            username=enroll_id,
            defaults={'email': email, 'first_name': first_name, 'last_name': last_name}
        )
        if created:
            user.set_password(password)
            user.save()

        profile, _ = StudentProfile.objects.get_or_create(
            user=user,
            defaults={
                'enroll_id': enroll_id,
                'class_name': class_name,
                'section': section,
                'phone': phone,
                'guardian': guardian,
                'guardian_phone': guardian_phone,
            }
        )
        return Response(StudentProfileSerializer(profile).data, status=201)


# ════════════════════════════════════════════
# CLASS GROUPS
# ════════════════════════════════════════════

class StaffClassGroupView(generics.ListCreateAPIView):
    serializer_class   = ClassGroupSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]
    queryset           = ClassGroup.objects.all()


class StaffClassGroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = ClassGroupSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]
    queryset           = ClassGroup.objects.all()


# ════════════════════════════════════════════
# ASSESSMENTS (Tests)
# ════════════════════════════════════════════

class StaffAssessmentView(generics.ListCreateAPIView):
    serializer_class   = AssessmentSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]

    def get_queryset(self):
        return Assessment.objects.filter(created_by=self.request.user).select_related('course')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class StaffAssessmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = AssessmentSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]

    def get_queryset(self):
        return Assessment.objects.filter(created_by=self.request.user)


# ════════════════════════════════════════════
# TASK MANAGEMENT
# ════════════════════════════════════════════

class StaffTaskListCreateView(generics.ListCreateAPIView):
    serializer_class   = TaskSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]

    def get_queryset(self):
        return Task.objects.filter(assigned_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)


class StaffSubmissionListView(generics.ListAPIView):
    """All task submissions for review."""
    serializer_class   = TaskSubmissionSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['student__enroll_id', 'task__title']

    def get_queryset(self):
        qs = TaskSubmission.objects.all().select_related('task', 'student__user')
        status_filter = self.request.query_params.get('status')
        if status_filter == 'pending':
            qs = qs.filter(grade='')
        elif status_filter == 'graded':
            qs = qs.exclude(grade='')
        return qs


class StaffGradeSubmissionView(APIView):
    """PATCH to grade a submission."""
    permission_classes = [IsAuthenticated, IsStaffMember]

    def patch(self, request, pk):
        try:
            submission = TaskSubmission.objects.get(pk=pk)
        except TaskSubmission.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

        grade    = request.data.get('grade', '').strip()
        feedback = request.data.get('feedback', '').strip()

        if not grade or len(grade) > 10:
            return Response({'detail': 'Grade is required and must be 10 characters or fewer.'}, status=400)
        if feedback and len(feedback) < 3:
            return Response({'detail': 'Feedback must contain at least 3 characters when provided.'}, status=400)

        submission.grade       = grade
        submission.feedback    = feedback
        submission.reviewed_by = request.user
        submission.reviewed_at = timezone.now()
        submission.save()

        return Response(TaskSubmissionSerializer(submission).data)


# ════════════════════════════════════════════
# STAFF SELF ATTENDANCE
# ════════════════════════════════════════════

class StaffSelfAttendanceView(generics.ListAPIView):
    serializer_class   = StaffAttendanceSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]

    def get_queryset(self):
        return StaffAttendance.objects.filter(staff=self.request.user).order_by('-date')


class StaffCheckInView(APIView):
    permission_classes = [IsAuthenticated, IsStaffMember]

    def post(self, request):
        today   = timezone.now().date()
        now_time = timezone.now().time()
        record, created = StaffAttendance.objects.get_or_create(
            staff=request.user, date=today,
            defaults={'check_in': now_time, 'status': 'present'}
        )
        if not created and record.check_in:
            return Response({'detail': 'Already checked in today.'}, status=400)
        if not created:
            record.check_in = now_time
            record.status   = 'present'
            record.save()
        return Response({'detail': f'Checked in at {now_time.strftime("%H:%M")}'})


class StaffCheckOutView(APIView):
    permission_classes = [IsAuthenticated, IsStaffMember]

    def post(self, request):
        today = timezone.now().date()
        try:
            record = StaffAttendance.objects.get(staff=request.user, date=today)
        except StaffAttendance.DoesNotExist:
            return Response({'detail': 'No check-in record found for today.'}, status=400)

        if record.check_out:
            return Response({'detail': 'Already checked out today.'}, status=400)

        now_time = timezone.now().time()
        record.check_out = now_time

        if record.check_in:
            from datetime import datetime, date
            dt_in  = datetime.combine(date.today(), record.check_in)
            dt_out = datetime.combine(date.today(), now_time)
            diff   = dt_out - dt_in
            h, rem = divmod(diff.seconds, 3600)
            m      = rem // 60
            record.total_hours = f"{h}h {m}m"

        record.save()
        return Response({'detail': f'Checked out at {now_time.strftime("%H:%M")}. Total: {record.total_hours}'})


# ════════════════════════════════════════════
# STUDENT ATTENDANCE (staff marks)
# ════════════════════════════════════════════

class StaffMarkStudentAttendanceView(APIView):
    permission_classes = [IsAuthenticated, IsStaffMember]

    def post(self, request):
        """
        Body: { "date": "2024-05-22", "class_name": "XI-A", "subject": "Mathematics",
                "records": [{"enroll_id": "STU-001", "status": "P"}, ...] }
        """
        date_str   = request.data.get('date')
        class_name = request.data.get('class_name')
        subject    = request.data.get('subject', '')
        records    = request.data.get('records', [])

        if not date_str or not class_name or not records:
            return Response({'detail': 'date, class_name and records are required.'}, status=400)
        if not isinstance(records, list):
            return Response({'detail': 'records must be a list.'}, status=400)

        saved = 0
        errors = []
        for rec in records:
            enroll_id = rec.get('enroll_id')
            att_status= rec.get('status', 'P')
            if not enroll_id or att_status not in ('P', 'A', 'L', 'T'):
                errors.append('Each record requires a valid enrollment ID and attendance status.')
                continue
            try:
                profile = StudentProfile.objects.get(enroll_id=enroll_id)
                AttendanceRecord.objects.update_or_create(
                    student=profile, date=date_str, subject=subject,
                    defaults={'status': att_status, 'marked_by': request.user}
                )
                saved += 1
            except StudentProfile.DoesNotExist:
                errors.append(f'Student {enroll_id} not found.')

        return Response({
            'detail': f'Attendance saved for {saved} students.',
            'errors': errors,
        })


# ════════════════════════════════════════════
# LEAVE REQUEST APPROVAL
# ════════════════════════════════════════════

class StaffLeaveRequestListView(generics.ListAPIView):
    serializer_class   = LeaveRequestSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]

    def get_queryset(self):
        return LeaveRequest.objects.all().select_related('student__user')


class StaffLeaveReviewView(APIView):
    permission_classes = [IsAuthenticated, IsStaffMember]

    def patch(self, request, pk):
        try:
            leave = LeaveRequest.objects.get(pk=pk)
        except LeaveRequest.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

        action = request.data.get('action')
        if action not in ('approve', 'reject'):
            return Response({'detail': 'action must be approve or reject.'}, status=400)

        leave.status      = 'approved' if action == 'approve' else 'rejected'
        leave.reviewed_by = request.user
        leave.save()
        return Response({'detail': f'Leave request {leave.status}.'})


# ════════════════════════════════════════════
# TICKETS (staff side)
# ════════════════════════════════════════════

class StaffTicketListView(generics.ListAPIView):
    serializer_class   = TicketSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['subject', 'student__enroll_id', 'category']

    def get_queryset(self):
        qs = Ticket.objects.all().prefetch_related('replies').select_related('student__user')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class StaffTicketReplyView(generics.CreateAPIView):
    serializer_class   = TicketReplySerializer
    permission_classes = [IsAuthenticated, IsStaffMember]

    def perform_create(self, serializer):
        ticket = serializer.save(author=self.request.user)
        return ticket


class StaffTicketStatusView(APIView):
    permission_classes = [IsAuthenticated, IsStaffMember]

    def patch(self, request, pk):
        try:
            ticket = Ticket.objects.get(pk=pk)
        except Ticket.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

        new_status = request.data.get('status')
        if new_status not in ('open', 'in_progress', 'resolved'):
            return Response({'detail': 'Invalid status.'}, status=400)

        ticket.status      = new_status
        ticket.assigned_to = request.user
        ticket.save()
        return Response({'detail': f'Ticket marked as {new_status}.'})


# ════════════════════════════════════════════
# NOTIFICATIONS (staff broadcast)
# ════════════════════════════════════════════

class StaffNotificationView(generics.ListAPIView):
    serializer_class   = NotificationSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')


class StaffBroadcastView(APIView):
    permission_classes = [IsAuthenticated, IsStaffMember]

    def post(self, request):
        """
        Body: { "title": "...", "body": "...", "target": "all_students" | "class:XI-A" }
        """
        title  = request.data.get('title', '').strip()
        body   = request.data.get('body', '').strip()
        target = request.data.get('target', 'all_students')

        if not title or not body:
            return Response({'detail': 'title and body are required.'}, status=400)

        if target == 'all_students':
            recipients = User.objects.filter(student_profile__isnull=False)
        elif target.startswith('class:'):
            class_name = target.split(':', 1)[1]
            recipients = User.objects.filter(student_profile__class_name=class_name)
        else:
            recipients = User.objects.filter(student_profile__isnull=False)

        notifs = [
            Notification(recipient=r, title=title, body=body, sent_by=request.user)
            for r in recipients
        ]
        Notification.objects.bulk_create(notifs, ignore_conflicts=True)

        return Response({'detail': f'Broadcast sent to {len(notifs)} recipients.'})


# ════════════════════════════════════════════
# EVENTS
# ════════════════════════════════════════════

class StaffEventListView(generics.ListAPIView):
    serializer_class   = EventSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]

    def get_queryset(self):
        from django.utils import timezone
        return Event.objects.filter(
            audience__in=['all', 'staff'],
            event_date__gte=timezone.now().date()
        )

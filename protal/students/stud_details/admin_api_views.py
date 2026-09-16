from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import (
    StudentProfile, Course, StudyMaterial, FeeTransaction, Mark,
    Notification, Ticket,
)
from .serializers import (
    StudentProfileSerializer, CourseSerializer, FeeTransactionSerializer,
    NotificationSerializer, TicketSerializer,
)
from .permissions import IsAdminUser, IsStaffMember
from staffs.staff.models import StaffProfile, Event, Assessment
from staffs.staff.serializers import StaffProfileSerializer, EventSerializer, AssessmentSerializer
from students.auth_stud.serializers import (
    AdminLoginSerializer,
    AdminSignupSerializer,
    ResetPasswordSerializer,
)

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes


# ════════════════════════════════════════════
# ADMIN AUTH
# ════════════════════════════════════════════

class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user  = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token':     token.key,
            'username':  user.username,
            'full_name': user.get_full_name() or user.username,
            'email':     user.email,
            'is_superuser': user.is_superuser,
        })


class AdminSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AdminSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'detail': 'Signup successful. Please login to continue.'},
            status=status.HTTP_201_CREATED,
        )


class AdminLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response({'detail': 'Logged out.'})


class AdminForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        try:
            user  = User.objects.get(email=email, is_superuser=True)
            uid   = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            # TODO: send email
        except User.DoesNotExist:
            pass
        return Response({'detail': 'If the email is registered, instructions have been sent.'})


class AdminResetPasswordView(APIView):
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
# ADMIN DASHBOARD
# ════════════════════════════════════════════

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        total_students  = StudentProfile.objects.count()
        total_hm = StaffProfile.objects.filter(designation__iexact='Head Master').count()
        total_staff = StaffProfile.objects.exclude(designation__iexact='Head Master').count()
        progress = Mark.objects.aggregate(average=Avg('scored'), subjects=Count('id'))

        return Response({
            'total_hm': total_hm,
            'total_staff': total_staff,
            'total_students': total_students,
            'academic_summary': {
                'average_marks': round(float(progress['average']), 1) if progress['average'] is not None else 0,
                'subjects_recorded': progress['subjects'],
            },
        })


# ════════════════════════════════════════════
# MANAGE COURSES
# ════════════════════════════════════════════

class AdminCourseListCreateView(generics.ListCreateAPIView):
    serializer_class   = CourseSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['code', 'name']
    queryset           = Course.objects.select_related('instructor').all()


class AdminCourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = CourseSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset           = Course.objects.all()

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


# ════════════════════════════════════════════
# MANAGE STUDENTS
# ════════════════════════════════════════════

class AdminStudentListView(generics.ListAPIView):
    serializer_class   = StudentProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['enroll_id', 'user__first_name', 'user__last_name', 'class_name', 'section']
    queryset           = StudentProfile.objects.select_related('user').all()


class AdminCreateStudentView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        enroll_id  = request.data.get('enroll_id', '').strip()
        first_name = request.data.get('first_name', '').strip()
        last_name  = request.data.get('last_name', '').strip()
        email      = request.data.get('email', '').strip()
        class_name = request.data.get('class_name', '').strip()
        password   = request.data.get('password', '').strip()
        section    = request.data.get('section', '').strip()

        if not all([enroll_id, first_name, class_name, email, password]):
            return Response({'detail': 'Enrollment ID, first name, class, email and password are required.'}, status=400)
        if len(password) < 6:
            return Response({'detail': 'Password must contain at least 6 characters.'}, status=400)
        try:
            validate_email(email)
        except DjangoValidationError:
            return Response({'detail': 'Enter a valid email address.'}, status=400)

        if StudentProfile.objects.filter(enroll_id=enroll_id).exists():
            return Response({'detail': 'Enrollment ID already in use.'}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({'detail': 'Email address already registered.'}, status=400)

        user = User.objects.create_user(
            username=enroll_id, email=email,
            password=password, first_name=first_name, last_name=last_name,
        )
        profile = StudentProfile.objects.create(
            user=user, enroll_id=enroll_id,
            class_name=class_name, section=section,
        )
        return Response(StudentProfileSerializer(profile).data, status=201)


class AdminStudentDetailView(generics.RetrieveUpdateAPIView):
    serializer_class   = StudentProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset           = StudentProfile.objects.select_related('user').all()


class AdminDeactivateStudentView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, pk):
        try:
            profile = StudentProfile.objects.get(pk=pk)
        except StudentProfile.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)
        profile.user.is_active = False
        profile.user.save()
        return Response({'detail': 'Student account deactivated.'})


# ════════════════════════════════════════════
# MANAGE STAFF
# ════════════════════════════════════════════

class AdminStaffListView(generics.ListAPIView):
    serializer_class   = StaffProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['user__first_name', 'user__last_name', 'user__email', 'department']
    queryset           = StaffProfile.objects.select_related('user').all()


class AdminHMListView(generics.ListAPIView):
    serializer_class   = StaffProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['user__first_name', 'user__last_name', 'user__email']
    queryset           = StaffProfile.objects.filter(designation__iexact='Head Master').select_related('user')


class AdminCreateHMView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        data = request.data.copy()
        data['full_name'] = data.get('full_name', '').strip()
        serializer = AdminSignupSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        first_name, _, last_name = data['full_name'].partition(' ')
        user.first_name = first_name
        user.last_name = last_name
        user.save(update_fields=['first_name', 'last_name'])
        profile = StaffProfile.objects.create(
            user=user,
            department='Administration',
            designation='Head Master',
        )
        return Response(StaffProfileSerializer(profile).data, status=201)


class AdminCreateStaffView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        first_name  = request.data.get('first_name', '').strip()
        last_name   = request.data.get('last_name', '').strip()
        email       = request.data.get('email', '').strip()
        department  = request.data.get('department', '').strip()
        password    = request.data.get('password', '').strip()

        if not all([first_name, email, department, password]):
            return Response({'detail': 'First name, department, email and password are required.'}, status=400)
        if len(password) < 6:
            return Response({'detail': 'Password must contain at least 6 characters.'}, status=400)
        try:
            validate_email(email)
        except DjangoValidationError:
            return Response({'detail': 'Enter a valid email address.'}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({'detail': 'Email address already registered.'}, status=400)

        username = email.split('@')[0]
        base     = username
        counter  = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username, email=email, password=password,
            first_name=first_name, last_name=last_name, is_staff=True,
        )
        profile = StaffProfile.objects.create(user=user, department=department)
        return Response(StaffProfileSerializer(profile).data, status=201)


class AdminDeactivateStaffView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, pk):
        try:
            profile = StaffProfile.objects.get(pk=pk)
        except StaffProfile.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)
        profile.user.is_active = False
        profile.user.save()
        profile.is_active = False
        profile.save()
        return Response({'detail': 'Staff account deactivated.'})


# ════════════════════════════════════════════
# EVENTS
# ════════════════════════════════════════════

class AdminEventView(generics.ListCreateAPIView):
    serializer_class   = EventSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset           = Event.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AdminEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = EventSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset           = Event.objects.all()


# ════════════════════════════════════════════
# COMMUNICATION
# ════════════════════════════════════════════

class AdminSendMessageView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        target    = request.data.get('target', 'all_students')
        title     = request.data.get('title', '').strip()
        body      = request.data.get('body', '').strip()
        important = request.data.get('important', False)

        if len(title) < 3 or len(body) < 3:
            return Response({'detail': 'Title and message must each contain at least 3 characters.'}, status=400)
        if not isinstance(important, bool):
            return Response({'detail': 'important must be true or false.'}, status=400)

        if target == 'all_students':
            recipients = User.objects.filter(is_active=True, student_profile__isnull=False)
        elif target == 'all_staff':
            recipients = User.objects.filter(is_active=True, is_staff=True)
        elif target.startswith('student:'):
            enroll_id = target.split(':', 1)[1]
            recipients = User.objects.filter(student_profile__enroll_id=enroll_id)
        elif target.startswith('staff:'):
            email = target.split(':', 1)[1]
            recipients = User.objects.filter(email=email, is_staff=True)
        else:
            recipients = User.objects.filter(is_active=True)

        notifs = [
            Notification(recipient=r, title=title, body=body, sent_by=request.user, is_important=important)
            for r in recipients
        ]
        Notification.objects.bulk_create(notifs)
        return Response({'detail': f'Message sent to {len(notifs)} recipients.'})


# ════════════════════════════════════════════
# REPORTS
# ════════════════════════════════════════════

class AdminStudentReportView(generics.ListAPIView):
    serializer_class   = StudentProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['enroll_id', 'class_name', 'section', 'user__first_name', 'user__last_name']
    queryset           = StudentProfile.objects.select_related('user').all()


class AdminStaffReportView(generics.ListAPIView):
    serializer_class   = StaffProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset           = StaffProfile.objects.select_related('user').all()


class AdminCourseReportView(generics.ListAPIView):
    serializer_class   = CourseSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset           = Course.objects.select_related('instructor').all()


# ════════════════════════════════════════════
# PAYMENTS
# ════════════════════════════════════════════

class AdminFeeTransactionListCreateView(generics.ListCreateAPIView):
    serializer_class   = FeeTransactionSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['student__enroll_id', 'description', 'status']

    def get_queryset(self):
        qs = FeeTransaction.objects.select_related('student__user').all()
        enroll = self.request.query_params.get('enroll_id')
        if enroll:
            qs = qs.filter(student__enroll_id=enroll)
        return qs

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class AdminFeeSummaryView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        total     = FeeTransaction.objects.aggregate(t=Sum('amount'))['t'] or 0
        collected = FeeTransaction.objects.filter(status='paid').aggregate(t=Sum('amount'))['t'] or 0
        pending   = FeeTransaction.objects.filter(status='pending').aggregate(t=Sum('amount'))['t'] or 0
        overdue   = FeeTransaction.objects.filter(status='overdue').aggregate(t=Sum('amount'))['t'] or 0
        overdue_count = StudentProfile.objects.filter(
            fee_transactions__status='overdue'
        ).distinct().count()

        return Response({
            'total_fees':          str(total),
            'collected':           str(collected),
            'pending':             str(pending),
            'overdue':             str(overdue),
            'overdue_students':    overdue_count,
        })

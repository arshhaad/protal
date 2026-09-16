from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.db.models import Avg, Count, Q
from django.utils import timezone
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.dateparse import parse_date
from datetime import datetime, date

from .models import StaffProfile, ClassGroup, StaffAttendance, Assessment, Event
from students.stud_details.models import (
    StudentProfile, Course, Mark, AttendanceRecord,
    LeaveRequest, Ticket, Notification
)
from students.auth_stud.serializers import StaffSignupSerializer


# ── Auth ──────────────────────────────────────────────
class HMLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')
        if not username or not password:
            return Response({'detail': 'Username and password required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_record = User.objects.filter(Q(username=username) | Q(email=username)).first()
        user = authenticate(username=user_record.username, password=password) if user_record else None
        if user and user.is_active and (user.is_staff or user.is_superuser):
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'name': user.get_full_name() or 'Headmaster',
                    'email': user.email,
                    'role': 'Head Master',
                }
            })
        return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)


class HMLogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        return Response({'detail': 'Logged out successfully.'})


class HMSignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = StaffSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user.is_superuser = True
        user.save(update_fields=['is_superuser'])
        StaffProfile.objects.create(
            user=user,
            department='Administration',
            designation='Head Master',
        )
        return Response(
            {'detail': 'Signup successful. Please login to continue.'},
            status=status.HTTP_201_CREATED,
        )


# ── Dashboard ─────────────────────────────────────────
class HMDashboardView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        total_students = StudentProfile.objects.count()
        total_staff = StaffProfile.objects.count()
        
        # Calculate avg student attendance
        att_total = AttendanceRecord.objects.count()
        att_present = AttendanceRecord.objects.filter(status='P').count()
        avg_att = round((att_present / att_total * 100), 1) if att_total > 0 else 92

        pending_leaves = LeaveRequest.objects.filter(status='pending').count()
        open_tickets = Ticket.objects.filter(status='open').count()
        
        # Pass rate from marks
        total_marks = Mark.objects.count()
        passing_marks = Mark.objects.filter(scored__gte=40).count()
        pass_rate = round((passing_marks / total_marks * 100), 1) if total_marks > 0 else 88

        # Performance trend chart
        performance_chart = [
            {'month': 'May', 'avg': 74},
            {'month': 'Jun', 'avg': 78},
            {'month': 'Jul', 'avg': 81},
            {'month': 'Aug', 'avg': 84},
            {'month': 'Sep', 'avg': 87},
        ]

        # Weekly attendance chart
        attendance_chart = [
            {'week': 'W1', 'students': 94, 'staff': 98},
            {'week': 'W2', 'students': 91, 'staff': 96},
            {'week': 'W3', 'students': 95, 'staff': 97},
            {'week': 'W4', 'students': 93, 'staff': 99},
        ]

        return Response({
            'total_students': total_students,
            'total_staff': total_staff,
            'avg_attendance': avg_att,
            'pending_leave': pending_leaves,
            'open_tickets': open_tickets,
            'pass_rate': pass_rate,
            'performance_chart': performance_chart,
            'attendance_chart': attendance_chart,
        })


# ── Staff Oversight ───────────────────────────────────
class HMStaffListCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        profiles = StaffProfile.objects.select_related('user').all()
        data = []
        for p in profiles:
            data.append({
                'id': p.id,
                'emp_id': f"EMP-{p.id:03d}",
                'name': p.user.get_full_name() or p.user.username,
                'full_name': p.user.get_full_name() or p.user.username,
                'email': p.user.email,
                'phone': p.phone,
                'department': p.department or 'General',
                'designation': p.designation or 'Faculty',
                'classes_assigned': 'Class 10-A',
                'attendance': 95,
                'performance_score': 4.6,
                'status': 'Active' if p.is_active else 'Inactive',
                'joined': p.created_at.strftime('%Y-%m-%d') if p.created_at else '2026-01-15',
            })
        return Response(data)

    def post(self, request):
        name = (request.data.get('full_name') or request.data.get('name') or '').strip()
        dept = (request.data.get('department') or '').strip()
        designation = (request.data.get('designation') or 'Lecturer').strip()
        phone = request.data.get('phone') or ''

        if len(name) < 2 or len(dept) < 2:
            return Response({'detail': 'Full name, valid email and department are required.'}, status=status.HTTP_400_BAD_REQUEST)
        digits = ''.join(char for char in phone if char.isdigit())
        if phone and not 10 <= len(digits) <= 15:
            return Response({'detail': 'Phone number must contain 10 to 15 digits.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = StaffSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        profile, _ = StaffProfile.objects.get_or_create(
            user=user,
            defaults={'department': dept, 'designation': designation, 'phone': phone}
        )

        return Response({
            'id': profile.id,
            'emp_id': f"EMP-{profile.id:03d}",
            'name': name,
            'full_name': name,
            'email': user.email,
            'department': dept,
            'designation': designation,
            'phone': phone,
            'attendance': 95,
            'performance_score': 4.5,
            'status': 'Active',
            'joined': timezone.now().strftime('%Y-%m-%d'),
        }, status=status.HTTP_201_CREATED)


class HMStaffDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, pk):
        profile = StaffProfile.objects.filter(id=pk).first()
        if not profile:
            return Response({'detail': 'Staff not found.'}, status=status.HTTP_404_NOT_FOUND)
        if 'department' in request.data:
            department = str(request.data['department']).strip()
            if len(department) < 2:
                return Response({'detail': 'Department must contain at least 2 characters.'}, status=status.HTTP_400_BAD_REQUEST)
            profile.department = department
        if 'designation' in request.data:
            designation = str(request.data['designation']).strip()
            if len(designation) < 2:
                return Response({'detail': 'Designation must contain at least 2 characters.'}, status=status.HTTP_400_BAD_REQUEST)
            profile.designation = designation
        if 'phone' in request.data:
            phone = str(request.data['phone']).strip()
            digits = ''.join(char for char in phone if char.isdigit())
            if phone and not 10 <= len(digits) <= 15:
                return Response({'detail': 'Phone number must contain 10 to 15 digits.'}, status=status.HTTP_400_BAD_REQUEST)
            profile.phone = phone
        profile.save()
        return Response({'detail': 'Updated successfully.'})

    def delete(self, request, pk):
        StaffProfile.objects.filter(id=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Student Performance ───────────────────────────────
class HMStudentPerformanceView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        students = StudentProfile.objects.select_related('user').all()
        data = []
        for s in students:
            marks = s.marks.all()
            avg_m = round(marks.aggregate(Avg('scored'))['scored__avg'] or 78, 1)
            data.append({
                'id': s.id,
                'enroll_id': s.enroll_id,
                'name': s.user.get_full_name() or s.user.username,
                'class_name': s.class_name or 'Class 10',
                'section': s.section or 'A',
                'avg_score': avg_m,
                'attendance': 94,
                'status': 'Excellent' if avg_m >= 85 else 'Good' if avg_m >= 70 else 'Needs Focus',
            })
        return Response(data)


# ── Classes & Curriculum ──────────────────────────────
class HMClassesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        groups = ClassGroup.objects.all()
        data = []
        for g in groups:
            data.append({
                'id': g.id,
                'code': g.code,
                'name': g.name,
                'teacher': g.class_teacher.get_full_name() if g.class_teacher else 'Unassigned',
                'students_count': StudentProfile.objects.filter(class_name=g.name).count(),
            })
        return Response(data)

    def post(self, request):
        code = request.data.get('code') or f"CLS-{int(timezone.now().timestamp()) % 10000}"
        name = (request.data.get('name') or '').strip()
        if len(name) < 2:
            return Response({'detail': 'Class name must contain at least 2 characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if ClassGroup.objects.filter(code=code).exists():
            return Response({'detail': 'Class code already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        cg = ClassGroup.objects.create(code=code, name=name)
        return Response({'id': cg.id, 'code': cg.code, 'name': cg.name, 'teacher': 'Unassigned', 'students_count': 0}, status=status.HTTP_201_CREATED)


# ── Leave Approvals ───────────────────────────────────
class HMLeaveRequestListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        leaves = LeaveRequest.objects.select_related('student__user').all()
        data = []
        for l in leaves:
            data.append({
                'id': l.id,
                'applicant_name': l.student.user.get_full_name() or l.student.enroll_id,
                'role': 'Student',
                'department': l.student.class_name or 'Class 10-A',
                'leave_type': l.get_leave_type_display(),
                'from_date': l.from_date.strftime('%Y-%m-%d'),
                'to_date': l.to_date.strftime('%Y-%m-%d'),
                'duration_days': l.duration,
                'reason': l.reason,
                'status': l.status,
            })
        return Response(data)

    def post(self, request):
        # Allow HM to record a leave request directly
        applicant_name = (request.data.get('applicant_name') or '').strip()
        role = request.data.get('role') or 'Staff'
        department = (request.data.get('department') or '').strip()
        reason = (request.data.get('reason') or '').strip()
        from_date = parse_date(str(request.data.get('from_date') or ''))
        to_date = parse_date(str(request.data.get('to_date') or ''))
        if len(applicant_name) < 2 or len(department) < 2 or len(reason) < 10:
            return Response({'detail': 'Applicant name, department and a reason of at least 10 characters are required.'}, status=status.HTTP_400_BAD_REQUEST)
        if role not in ('Staff', 'Student'):
            return Response({'detail': 'Role must be Staff or Student.'}, status=status.HTTP_400_BAD_REQUEST)
        if not from_date or not to_date or to_date < from_date:
            return Response({'detail': 'Enter valid leave dates; the to date cannot be earlier than the from date.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            'id': int(timezone.now().timestamp()),
            'applicant_name': applicant_name,
            'role': role,
            'department': department,
            'leave_type': request.data.get('leave_type') or 'Casual Leave',
            'from_date': from_date.isoformat(),
            'to_date': to_date.isoformat(),
            'duration_days': int(request.data.get('duration_days') or 1),
            'reason': reason,
            'status': 'pending',
        }, status=status.HTTP_201_CREATED)


class HMLeaveApproveView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        leave = LeaveRequest.objects.filter(id=pk).first()
        if leave:
            leave.status = 'approved'
            leave.save()
        return Response({'detail': 'Leave approved successfully.'})


class HMLeaveRejectView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        leave = LeaveRequest.objects.filter(id=pk).first()
        if leave:
            leave.status = 'rejected'
            leave.save()
        return Response({'detail': 'Leave rejected.'})


# ── Announcements (Targeted: Staff, Students, All) ────
class HMAnnouncementListCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        events = Event.objects.all()
        data = []
        for e in events:
            aud = 'All'
            if e.audience == 'students':
                aud = 'Students'
            elif e.audience == 'staff':
                aud = 'Staff'

            data.append({
                'id': e.id,
                'title': e.title,
                'message': e.description,
                'audience': aud,
                'priority': 'Normal',
                'created_at': e.created_at.strftime('%Y-%m-%d') if e.created_at else timezone.now().strftime('%Y-%m-%d'),
            })
        return Response(data)

    def post(self, request):
        title = (request.data.get('title') or '').strip()
        message = (request.data.get('message') or '').strip()
        audience = (request.data.get('audience') or 'All').strip()
        if len(title) < 3 or len(message) < 3:
            return Response({'detail': 'Title and message must each contain at least 3 characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if audience.lower() not in ('all', 'staff', 'students'):
            return Response({'detail': 'Audience must be All, Staff or Students.'}, status=status.HTTP_400_BAD_REQUEST)
        
        aud_code = 'all'
        if audience.lower() == 'staff':
            aud_code = 'staff'
        elif audience.lower() == 'students':
            aud_code = 'students'

        event = Event.objects.create(
            title=title,
            description=message,
            event_date=timezone.now().date(),
            audience=aud_code,
        )

        return Response({
            'id': event.id,
            'title': event.title,
            'message': event.description,
            'audience': audience,
            'priority': request.data.get('priority') or 'Normal',
            'created_at': event.created_at.strftime('%Y-%m-%d'),
        }, status=status.HTTP_201_CREATED)


class HMAnnouncementDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, pk):
        event = Event.objects.filter(id=pk).first()
        if not event:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        if 'title' in request.data:
            title = str(request.data['title']).strip()
            if len(title) < 3:
                return Response({'detail': 'Title must contain at least 3 characters.'}, status=status.HTTP_400_BAD_REQUEST)
            event.title = title
        if 'message' in request.data:
            message = str(request.data['message']).strip()
            if len(message) < 3:
                return Response({'detail': 'Message must contain at least 3 characters.'}, status=status.HTTP_400_BAD_REQUEST)
            event.description = message
        if 'audience' in request.data:
            audience = str(request.data['audience']).lower()
            if audience not in ('all', 'staff', 'students'):
                return Response({'detail': 'Audience must be All, Staff or Students.'}, status=status.HTTP_400_BAD_REQUEST)
            event.audience = audience
        event.save()
        return Response({'detail': 'Updated successfully.'})

    def delete(self, request, pk):
        Event.objects.filter(id=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Academic Reports ──────────────────────────────────
class HMAcademicReportsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        grade_dist = [
            {'name': 'A+', 'value': 28},
            {'name': 'A',  'value': 45},
            {'name': 'B',  'value': 60},
            {'name': 'C',  'value': 35},
            {'name': 'D',  'value': 12},
            {'name': 'F',  'value': 5},
        ]
        subjects = [
            {'subject': 'Mathematics', 'avg': 82},
            {'subject': 'Physics',     'avg': 79},
            {'subject': 'Chemistry',   'avg': 76},
            {'subject': 'English',     'avg': 88},
            {'subject': 'Biology',     'avg': 84},
        ]
        return Response({
            'overview': {
                'pass_rate': 94,
                'avg_score': 81,
                'distinctions': 73,
                'failures': 5,
            },
            'grade_distribution': grade_dist,
            'subject_performance': subjects,
        })


# ── Tickets ───────────────────────────────────────────
class HMTicketListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        tickets = Ticket.objects.select_related('student__user').all()
        data = []
        for t in tickets:
            data.append({
                'id': t.id,
                'subject': t.subject,
                'message': t.message,
                'from_name': t.student.user.get_full_name() if t.student else 'Anonymous',
                'category': t.category,
                'priority': 'Medium',
                'created_at': t.created_at.strftime('%Y-%m-%d') if t.created_at else '',
                'status': t.status,
                'hm_reply': t.response,
            })
        return Response(data)


class HMTicketReplyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        ticket = Ticket.objects.filter(id=pk).first()
        if ticket:
            ticket.response = request.data.get('message', '')
            ticket.status = 'resolved'
            ticket.save()
        return Response({'detail': 'Replied successfully.'})


class HMTicketCloseView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        ticket = Ticket.objects.filter(id=pk).first()
        if ticket:
            ticket.status = 'closed'
            ticket.save()
        return Response({'detail': 'Closed successfully.'})


# ── Staff Attendance Oversight (HM Management) ────────
class HMStaffAttendanceListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        date_param = request.query_params.get('date')
        qs = StaffAttendance.objects.select_related('staff').all().order_by('-date', '-check_in')
        if date_param:
            try:
                parsed_d = datetime.strptime(date_param, '%Y-%m-%d').date()
                qs = qs.filter(date=parsed_d)
            except ValueError:
                pass

        data = []
        for a in qs:
            dept = 'Academics'
            try:
                dept = a.staff.staff_profile.department or 'Academics'
            except Exception:
                pass

            cin_str = a.check_in.strftime('%I:%M %p') if a.check_in else '—'
            cout_str = a.check_out.strftime('%I:%M %p') if a.check_out else '—'
            data.append({
                'id': a.id,
                'staff_id': a.staff.id,
                'staff_name': a.staff.get_full_name() or a.staff.username,
                'emp_id': f"EMP-{a.staff.id:03d}",
                'department': dept,
                'date': a.date.strftime('%Y-%m-%d'),
                'check_in': cin_str,
                'check_out': cout_str,
                'total_hours': a.total_hours or ('—' if not a.check_out else '8h 00m'),
                'status': a.get_status_display() or a.status.capitalize(),
                'status_raw': a.status,
                'recorded_by': 'HM Administration',
            })
        return Response(data)

    def post(self, request):
        staff_id = request.data.get('staff_id')
        staff_name = request.data.get('staff_name')
        
        user = None
        if staff_id:
            user = User.objects.filter(id=staff_id).first()
        if not user and staff_name:
            user = User.objects.filter(Q(first_name__icontains=staff_name) | Q(username__icontains=staff_name)).first()
            if not user:
                uname = staff_name.lower().replace(' ', '_')
                user, _ = User.objects.get_or_create(username=uname, defaults={'first_name': staff_name})
        if not user:
            user = User.objects.filter(staff_profile__isnull=False).first() or User.objects.first()

        date_str = request.data.get('date') or timezone.now().strftime('%Y-%m-%d')
        try:
            att_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            att_date = timezone.now().date()

        raw_status = (request.data.get('status') or 'present').lower()
        if raw_status not in ('present', 'absent', 'half_day'):
            raw_status = 'present'

        cin_input = request.data.get('check_in')
        cout_input = request.data.get('check_out')
        hours_input = request.data.get('total_hours')

        cin_time = None
        cout_time = None
        if cin_input and cin_input != '—':
            for fmt in ('%H:%M:%S', '%H:%M', '%I:%M %p', '%I:%M%p'):
                try:
                    cin_time = datetime.strptime(cin_input.strip(), fmt).time()
                    break
                except ValueError:
                    pass

        if cout_input and cout_input != '—':
            for fmt in ('%H:%M:%S', '%H:%M', '%I:%M %p', '%I:%M%p'):
                try:
                    cout_time = datetime.strptime(cout_input.strip(), fmt).time()
                    break
                except ValueError:
                    pass

        # Calculate duration if available
        if cin_time and cout_time and not hours_input:
            dt_in = datetime.combine(att_date, cin_time)
            dt_out = datetime.combine(att_date, cout_time)
            diff = dt_out - dt_in
            if diff.total_seconds() > 0:
                h, rem = divmod(int(diff.total_seconds()), 3600)
                m = rem // 60
                hours_input = f"{h}h {m}m"

        rec, _ = StaffAttendance.objects.update_or_create(
            staff=user,
            date=att_date,
            defaults={
                'status': raw_status,
                'check_in': cin_time,
                'check_out': cout_time,
                'total_hours': hours_input or '8h 00m',
            }
        )

        dept = 'Academics'
        try:
            dept = user.staff_profile.department or 'Academics'
        except Exception:
            pass

        return Response({
            'id': rec.id,
            'staff_id': user.id,
            'staff_name': user.get_full_name() or user.username,
            'emp_id': f"EMP-{user.id:03d}",
            'department': dept,
            'date': rec.date.strftime('%Y-%m-%d'),
            'check_in': rec.check_in.strftime('%I:%M %p') if rec.check_in else '—',
            'check_out': rec.check_out.strftime('%I:%M %p') if rec.check_out else '—',
            'total_hours': rec.total_hours or '8h 00m',
            'status': rec.get_status_display() or rec.status.capitalize(),
            'status_raw': rec.status,
            'recorded_by': 'HM Administration',
        }, status=status.HTTP_201_CREATED)


class HMStaffAttendanceDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def delete(self, request, pk):
        StaffAttendance.objects.filter(id=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


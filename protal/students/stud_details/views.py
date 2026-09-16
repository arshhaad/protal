"""
stud_details/views.py
=====================
All protected student-facing views for the portal dashboard.
Every view requires login; students without a profile see a
graceful fallback instead of a 500 error.
"""

import logging

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.db.models import Avg, Count, Q

from .models import (
    StudentProfile, Course, StudyMaterial, ExamSchedule, Mark,
    AttendanceRecord, Session, Task, TaskSubmission, LeaveRequest,
    FeeTransaction, Notification, Ticket, ContactMessage,
)

logger = logging.getLogger(__name__)


# ── Helper ────────────────────────────────────────────────

def _get_profile(user):
    """Safely return the StudentProfile for a user, or None."""
    try:
        return user.student_profile
    except StudentProfile.DoesNotExist:
        return None


# ──────────────────────────────────────────────────────────
#  PROFILE
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def profile(request):
    """Display and update the student's personal profile."""
    student = _get_profile(request.user)

    if request.method == 'POST' and student:
        user = request.user

        # Update User model fields
        name_parts = request.POST.get('full_name', '').split(' ', 1)
        user.first_name = name_parts[0]
        user.last_name  = name_parts[1] if len(name_parts) > 1 else ''
        user.email      = request.POST.get('email', user.email).strip()
        user.save(update_fields=['first_name', 'last_name', 'email'])

        # Update StudentProfile fields
        student.phone          = request.POST.get('phone', '').strip()
        student.address        = request.POST.get('address', '').strip()
        student.guardian       = request.POST.get('guardian', '').strip()
        student.guardian_phone = request.POST.get('guardian_phone', '').strip()
        dob_val = request.POST.get('dob', '')
        if dob_val:
            student.dob = dob_val
        gender = request.POST.get('gender', '')
        if gender in ('M', 'F', 'O'):
            student.gender = gender
        student.save()

        messages.success(request, 'Profile updated successfully.')
        logger.info("Profile updated for: %s", request.user.username)
        return redirect('profile')

    return render(request, 'Profile.html', {'student': student})


# ──────────────────────────────────────────────────────────
#  EXAM DETAILS
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def exam_details(request):
    """List all exams for the student's class."""
    student = _get_profile(request.user)
    exams = ExamSchedule.objects.filter(class_name=student.class_name) if (student and student.class_name) else ExamSchedule.objects.all()
    context = {'student': student, 'exams': exams}
    return render(request, 'Exam_details.html', context)


# ──────────────────────────────────────────────────────────
#  MARKS
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def marks(request):
    """Display the student's subject-wise marks."""
    student = _get_profile(request.user)
    if student:
        marks_qs = Mark.objects.filter(student=student)
        avg_pct = marks_qs.aggregate(Avg('scored'))['scored__avg'] or 0
        best_sub = marks_qs.order_by('-scored').first()
        context = {
            'student': student,
            'marks': marks_qs,
            'avg_percentage': round(avg_pct, 1) if avg_pct else 0,
            'exams_appeared': marks_qs.count(),
            'best_subject': best_sub.subject if best_sub else '—',
            'rank': '—',
        }
    else:
        context = {
            'student': None,
            'marks': [],
            'avg_percentage': 0,
            'exams_appeared': 0,
            'best_subject': '—',
            'rank': '—',
        }
    return render(request, 'Marks.html', context)


# ──────────────────────────────────────────────────────────
#  ATTENDANCE
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def attendance(request):
    """Show attendance summary and daily log."""
    student = _get_profile(request.user)
    if student:
        log = AttendanceRecord.objects.filter(student=student)
        total = log.count()
        present_count = log.filter(status='P').count()
        absent_count = log.filter(status='A').count()
        late_count = log.filter(status='L').count()
        leave_count = log.filter(status='E').count()
        pct = round((present_count / total) * 100) if total > 0 else 0
        context = {
            'student': student,
            'attendance_log': log,
            'attendance_pct': pct,
            'present_days': present_count,
            'absent_days': absent_count,
            'late_days': late_count,
            'leave_days': leave_count,
        }
    else:
        context = {
            'student': None,
            'attendance_log': [],
            'attendance_pct': 0,
            'present_days': 0,
            'absent_days': 0,
            'late_days': 0,
            'leave_days': 0,
        }
    return render(request, 'Attendance.html', context)


# ──────────────────────────────────────────────────────────
#  SESSIONS
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def sessions(request):
    """Virtual class sessions — live, upcoming, and recorded."""
    student = _get_profile(request.user)
    sessions_qs = Session.objects.filter(class_name=student.class_name) if (student and student.class_name) else Session.objects.all()
    context = {'student': student, 'sessions': sessions_qs}
    return render(request, 'Sessions.html', context)


# ──────────────────────────────────────────────────────────
#  MY COURSES
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def my_courses(request):
    """List enrolled courses with textbook and PDF resources."""
    student = _get_profile(request.user)
    courses_qs = Course.objects.filter(class_name=student.class_name, is_active=True) if (student and student.class_name) else Course.objects.filter(is_active=True)
    context = {'student': student, 'courses': courses_qs}
    return render(request, 'My_Courses(text book &PDF ).html', context)


# ──────────────────────────────────────────────────────────
#  STUDENT PROGRESS
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def student_progress(request):
    """Analytics view showing term-wise performance and competency."""
    student = _get_profile(request.user)
    gpa = 0.0
    assignments_count = 0
    if student:
        marks_qs = Mark.objects.filter(student=student)
        avg_score = marks_qs.aggregate(Avg('scored'))['scored__avg']
        if avg_score:
            gpa = round((float(avg_score) / 100.0) * 4.0, 2)
        assignments_count = TaskSubmission.objects.filter(student=student).count()

    context = {
        'student': student,
        'gpa': gpa,
        'assignments_count': assignments_count,
    }
    return render(request, 'Student_Progress.html', context)


# ──────────────────────────────────────────────────────────
#  TASKS
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def tasks(request):
    """
    Task management — To Do / In Progress / Done.
    POST creates a new task.
    """
    student = _get_profile(request.user)

    if request.method == 'POST' and student:
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        due_date = request.POST.get('due_date') or None
        if title:
            Task.objects.create(
                title=title,
                description=description,
                assigned_by=request.user,
                due_date=due_date,
                class_name=student.class_name or '',
            )
            messages.success(request, 'Task created successfully.')
            return redirect('tasks')

    tasks_qs = Task.objects.filter(Q(class_name=student.class_name) | Q(assigned_by=request.user)) if student else Task.objects.none()
    context = {'student': student, 'tasks': tasks_qs}
    return render(request, 'Tasks.html', context)


# ──────────────────────────────────────────────────────────
#  LEAVE REQUEST
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def leave_request(request):
    """Submit a leave application and view past requests."""
    student = _get_profile(request.user)

    if request.method == 'POST' and student:
        leave_type = request.POST.get('leave_type', '').strip()
        from_date  = request.POST.get('from_date', '').strip()
        to_date    = request.POST.get('to_date', '').strip()
        reason     = request.POST.get('reason', '').strip()
        document   = request.FILES.get('document')

        if not all([leave_type, from_date, to_date, reason]):
            messages.error(request, 'Please fill in all required fields.')
        else:
            LeaveRequest.objects.create(
                student=student,
                leave_type=leave_type,
                from_date=from_date,
                to_date=to_date,
                reason=reason,
                document=document,
            )
            logger.info(
                "Leave request submitted by %s: %s → %s (%s)",
                student.enroll_id, from_date, to_date, leave_type
            )
            messages.success(
                request,
                'Your leave application has been submitted for approval.'
            )
            return redirect('leave_request')

    history = LeaveRequest.objects.filter(student=student) if student else []
    context = {'student': student, 'leave_history': history}
    return render(request, 'Leave_Request.html', context)


# ──────────────────────────────────────────────────────────
#  PAYMENT
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def payment(request):
    """View fee status, outstanding balance, and transaction history."""
    student = _get_profile(request.user)
    transactions = FeeTransaction.objects.filter(student=student) if student else []
    due_amount = 0
    for t in transactions:
        if t.status == 'P':
            due_amount += t.amount

    context = {
        'student': student,
        'due_amount': due_amount,
        'transactions': transactions,
    }
    return render(request, 'Payment.html', context)


# ──────────────────────────────────────────────────────────
#  NOTIFICATIONS
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def notifications(request):
    """Display all notifications for the student."""
    student = _get_profile(request.user)
    notifs = Notification.objects.filter(Q(recipient=request.user) | Q(recipient__isnull=True))
    context = {'student': student, 'notifications': notifs}
    return render(request, 'Notifications.html', context)


# ──────────────────────────────────────────────────────────
#  TICKETS
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def tickets(request):
    """
    Support ticket management.
    POST creates a new ticket.
    """
    student = _get_profile(request.user)

    if request.method == 'POST' and student:
        category    = request.POST.get('category', '').strip()
        subject     = request.POST.get('subject', '').strip()
        description = request.POST.get('description', '').strip()

        if not all([category, subject, description]):
            messages.error(request, 'Please fill in all required fields.')
        else:
            Ticket.objects.create(
                student=student,
                category=category,
                subject=subject,
                description=description,
            )
            logger.info(
                "Support ticket raised by %s: [%s] %s",
                student.enroll_id, category, subject
            )
            messages.success(
                request,
                'Your support ticket has been submitted. We will respond shortly.'
            )
            return redirect('tickets')

    tkts = Ticket.objects.filter(student=student) if student else []
    context = {'student': student, 'tickets': tkts}
    return render(request, 'Tickets.html', context)


# ──────────────────────────────────────────────────────────
#  CONTACT US
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def contact_us(request):
    """Send a message to a school department."""
    student = _get_profile(request.user)

    if request.method == 'POST' and student:
        department = request.POST.get('department', '').strip()
        subject    = request.POST.get('subject', '').strip()
        message    = request.POST.get('message', '').strip()

        if not all([department, subject, message]):
            messages.error(request, 'Please fill in all required fields.')
        else:
            ContactMessage.objects.create(
                student=student,
                department=department,
                subject=subject,
                message=message,
            )
            logger.info(
                "Contact message from %s to %s: %s",
                student.enroll_id, department, subject
            )
            messages.success(
                request,
                'Your message has been sent. The team will respond within 24 hours.'
            )
            return redirect('contact_us')

    context = {'student': student}
    return render(request, 'Contact_us.html', context)

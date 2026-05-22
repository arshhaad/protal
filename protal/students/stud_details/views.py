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

from .models import StudentProfile

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
    # Future: exams = Exam.objects.filter(class_name=student.class_name)
    context = {'student': student, 'exams': []}
    return render(request, 'Exam_details.html', context)


# ──────────────────────────────────────────────────────────
#  MARKS
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def marks(request):
    """Display the student's subject-wise marks."""
    student = _get_profile(request.user)
    # Future: marks = Mark.objects.filter(student=student)
    context = {'student': student, 'marks': []}
    return render(request, 'Marks.html', context)


# ──────────────────────────────────────────────────────────
#  ATTENDANCE
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def attendance(request):
    """Show attendance summary and daily log."""
    student = _get_profile(request.user)
    # Future: records = Attendance.objects.filter(student=student)
    context = {'student': student, 'attendance_log': []}
    return render(request, 'Attendance.html', context)


# ──────────────────────────────────────────────────────────
#  SESSIONS
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def sessions(request):
    """Virtual class sessions — live, upcoming, and recorded."""
    student = _get_profile(request.user)
    # Future: sessions = Session.objects.filter(class_name=student.class_name)
    context = {'student': student, 'sessions': []}
    return render(request, 'Sessions.html', context)


# ──────────────────────────────────────────────────────────
#  MY COURSES
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def my_courses(request):
    """List enrolled courses with textbook and PDF resources."""
    student = _get_profile(request.user)
    # Future: courses = Course.objects.filter(class_name=student.class_name)
    context = {'student': student, 'courses': []}
    return render(request, 'My_Courses(text book &PDF ).html', context)


# ──────────────────────────────────────────────────────────
#  STUDENT PROGRESS
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def student_progress(request):
    """Analytics view showing term-wise performance and competency."""
    student = _get_profile(request.user)
    context = {'student': student}
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
    # Future: tasks = Task.objects.filter(student=student)
    context = {'student': student, 'tasks': []}
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

        if not all([leave_type, from_date, to_date, reason]):
            messages.error(request, 'Please fill in all required fields.')
        else:
            # Future: LeaveRequest.objects.create(student=student, ...)
            logger.info(
                "Leave request submitted by %s: %s → %s (%s)",
                student.enroll_id, from_date, to_date, leave_type
            )
            messages.success(
                request,
                'Your leave application has been submitted for approval.'
            )
            return redirect('leave_request')

    context = {'student': student, 'leave_history': []}
    return render(request, 'Leave_Request.html', context)


# ──────────────────────────────────────────────────────────
#  PAYMENT
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def payment(request):
    """View fee status, outstanding balance, and transaction history."""
    student = _get_profile(request.user)
    # Future: transactions = FeeTransaction.objects.filter(student=student)
    context = {
        'student': student,
        'due_amount': 0,          # Replace with real DB value
        'transactions': [],
    }
    return render(request, 'Payment.html', context)


# ──────────────────────────────────────────────────────────
#  NOTIFICATIONS
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def notifications(request):
    """Display all notifications for the student."""
    student = _get_profile(request.user)
    # Future: notifs = Notification.objects.filter(student=student)
    context = {'student': student, 'notifications': []}
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
            # Future: Ticket.objects.create(student=student, ...)
            logger.info(
                "Support ticket raised by %s: [%s] %s",
                student.enroll_id, category, subject
            )
            messages.success(
                request,
                'Your support ticket has been submitted. We will respond shortly.'
            )
            return redirect('tickets')

    context = {'student': student, 'tickets': []}
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
            # Future: ContactMessage.objects.create(...) or send email
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

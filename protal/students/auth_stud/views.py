"""
auth_stud/views.py
==================
Handles all student authentication flows:
  - login_view        → Login with Enroll ID + Password
  - logout_view       → Logout and redirect to login
  - forget_password   → Request OTP / email reset by Enroll ID
  - reset_pass        → Set new password (via token link)
  - dashboard         → Protected home for authenticated students
"""

import logging

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.shortcuts import get_object_or_404, redirect, render
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from students.stud_details.models import StudentProfile

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────
#  LOGIN
# ──────────────────────────────────────────────────────────

def login_view(request):
    """
    Authenticate a student by Enroll ID + password.
    On success, redirect to dashboard; on failure, show error.
    """
    # Already logged-in → skip login page
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        enroll_id = request.POST.get('enroll_id', '').strip()
        password  = request.POST.get('password', '')

        if not enroll_id or not password:
            messages.error(request, 'Please enter both Enrollment ID and password.')
            return render(request, 'login.html', {'enroll_id': enroll_id})

        # Look up student by enroll_id → get linked Django user
        try:
            profile = StudentProfile.objects.select_related('user').get(
                enroll_id=enroll_id
            )
        except StudentProfile.DoesNotExist:
            logger.warning("Login attempt with unknown enroll_id: %s", enroll_id)
            messages.error(request, 'Invalid Enrollment ID or password.')
            return render(request, 'login.html', {'enroll_id': enroll_id})

        # Authenticate using the linked username
        user = authenticate(
            request,
            username=profile.user.username,
            password=password
        )

        if user is not None:
            if user.is_active:
                login(request, user)
                logger.info("Student logged in: %s", enroll_id)
                # Honour ?next= redirect if present
                next_url = request.GET.get('next', 'dashboard')
                return redirect(next_url)
            else:
                messages.error(
                    request,
                    'Your account is inactive. Please contact administration.'
                )
        else:
            logger.warning("Failed login for enroll_id: %s", enroll_id)
            messages.error(request, 'Invalid Enrollment ID or password.')

        return render(request, 'login.html', {'enroll_id': enroll_id})

    return render(request, 'login.html')


# ──────────────────────────────────────────────────────────
#  LOGOUT
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def logout_view(request):
    """Log the student out and redirect to the login page."""
    logger.info("Student logged out: %s", request.user.username)
    logout(request)
    messages.success(request, 'You have been logged out successfully.')
    return redirect('login')


# ──────────────────────────────────────────────────────────
#  FORGOT PASSWORD
# ──────────────────────────────────────────────────────────

def forget_password(request):
    """
    Student submits their Enroll ID.
    A password-reset link (UID + token) is generated.
    In production wire this to email; here we redirect directly
    (token is embedded in the success message for demo).
    """
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        enroll_id = request.POST.get('enroll_id', '').strip()

        if not enroll_id:
            messages.error(request, 'Please enter your Enrollment ID.')
            return render(request, 'forget_password.html')

        try:
            profile = StudentProfile.objects.select_related('user').get(
                enroll_id=enroll_id
            )
        except StudentProfile.DoesNotExist:
            # Security: show same message regardless of existence
            messages.success(
                request,
                'If that Enrollment ID is registered, reset instructions have been sent.'
            )
            return render(request, 'forget_password.html')

        user  = profile.user
        uid   = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # TODO: send email with reset link in production
        # reset_link = request.build_absolute_uri(
        #     reverse('reset_pass', kwargs={'uidb64': uid, 'token': token})
        # )
        # send_mail('Reset your password', reset_link, settings.DEFAULT_FROM_EMAIL, [user.email])

        logger.info(
            "Password reset requested for enroll_id: %s  uid=%s token=%s",
            enroll_id, uid, token
        )

        messages.success(
            request,
            'Password reset instructions have been sent to your registered email.'
        )
        # Redirect to reset page directly (demo mode — no email needed)
        return redirect('reset_pass', uidb64=uid, token=token)

    return render(request, 'forget_password.html')


# ──────────────────────────────────────────────────────────
#  RESET PASSWORD
# ──────────────────────────────────────────────────────────

def reset_pass(request, uidb64, token):
    """
    Validate UID + token, then allow the student to set a new password.
    """
    if request.user.is_authenticated:
        return redirect('dashboard')

    # Decode & validate the user
    try:
        uid  = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is None or not default_token_generator.check_token(user, token):
        messages.error(
            request,
            'This password reset link is invalid or has expired. '
            'Please request a new one.'
        )
        return redirect('forget_password')

    if request.method == 'POST':
        new_password  = request.POST.get('new_password', '')
        confirm_password = request.POST.get('confirm_password', '')

        # Basic server-side validation
        if len(new_password) < 8:
            messages.error(request, 'Password must be at least 8 characters long.')
            return render(request, 'reset_pass.html',
                          {'uidb64': uidb64, 'token': token})

        if new_password != confirm_password:
            messages.error(request, 'Passwords do not match.')
            return render(request, 'reset_pass.html',
                          {'uidb64': uidb64, 'token': token})

        user.set_password(new_password)
        user.save()
        logger.info("Password reset successfully for user: %s", user.username)
        messages.success(
            request,
            'Your password has been updated successfully. Please login.'
        )
        return redirect('login')

    return render(request, 'reset_pass.html', {'uidb64': uidb64, 'token': token})


# ──────────────────────────────────────────────────────────
#  DASHBOARD
# ──────────────────────────────────────────────────────────

@login_required(login_url='login')
def dashboard(request):
    """
    Main student dashboard — protected view.
    Fetches the student's profile and passes summary context.
    """
    try:
        student = request.user.student_profile
    except StudentProfile.DoesNotExist:
        student = None

    context = {
        'student': student,
    }
    return render(request, 'dashboard.html', context)

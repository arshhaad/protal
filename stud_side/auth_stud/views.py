from django.shortcuts import render, redirect
from django.contrib import messages

# Default user for testing/demo
DEFAULT_ENROLL_ID = "STU202601"
DEFAULT_PASSWORD = "student123"

def home_redirect(request):
    """Redirects the user to the dashboard if logged in, otherwise to login."""
    if 'enroll_id' in request.session:
        return redirect('student:dashboard')
    return redirect('student:login')

def login_view(request):
    """Handles student login."""
    if 'enroll_id' in request.session:
        return redirect('student:dashboard')
        
    if request.method == 'POST':
        enroll_id = request.POST.get('enroll_id', '').strip()
        password = request.POST.get('password', '')
        
        if not enroll_id or not password:
            messages.error(request, "Please enter both Enrollment ID and Password.")
        elif enroll_id == DEFAULT_ENROLL_ID and password == DEFAULT_PASSWORD:
            # Set session parameters for the logged-in student
            request.session['enroll_id'] = enroll_id
            request.session['student_name'] = "Alex Mercer"
            request.session['student_email'] = "alex.mercer@academy.edu"
            request.session['department'] = "Computer Science & Engineering"
            request.session['semester'] = "6th Semester"
            request.session['roll_no'] = "CSE-2026-089"
            request.session['avatar_url'] = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200"
            messages.success(request, f"Welcome back, {request.session['student_name']}!")
            return redirect('student:dashboard')
        else:
            messages.error(request, "Invalid Enrollment ID or Password. Try STU202601 / student123")
            
    return render(request, 'student/login.html')

def forgot_password_view(request):
    """Handles forgot password page (mock)."""
    if request.method == 'POST':
        enroll_id = request.POST.get('enroll_id', '').strip()
        email = request.POST.get('email', '').strip()
        
        if enroll_id == DEFAULT_ENROLL_ID:
            messages.success(request, "A password reset link has been sent to your registered email.")
            return redirect('student:reset_password')
        else:
            messages.error(request, "Enrollment ID and Email mismatch or not found.")
            
    return render(request, 'student/forgot_password.html')

def reset_password_view(request):
    """Handles password reset confirmation (mock)."""
    if request.method == 'POST':
        new_password = request.POST.get('password', '')
        confirm_password = request.POST.get('confirm_password', '')
        
        if len(new_password) < 6:
            messages.error(request, "Password must be at least 6 characters long.")
        elif new_password != confirm_password:
            messages.error(request, "Passwords do not match.")
        else:
            messages.success(request, "Your password has been successfully reset. Please login with your new password.")
            return redirect('student:login')
            
    return render(request, 'student/reset_password.html')

def dashboard_view(request):
    """Renders the dashboard with student's profile context."""
    if 'enroll_id' not in request.session:
        messages.error(request, "Please log in to access the Student Portal.")
        return redirect('student:login')
        
    context = {
        'enroll_id': request.session.get('enroll_id'),
        'student_name': request.session.get('student_name'),
        'student_email': request.session.get('student_email'),
        'department': request.session.get('department'),
        'semester': request.session.get('semester'),
        'roll_no': request.session.get('roll_no'),
        'avatar_url': request.session.get('avatar_url'),
    }
    return render(request, 'student/stud_dashboard.html', context)

def logout_view(request):
    """Logs the student out."""
    request.session.flush()
    messages.success(request, "You have been successfully logged out.")
    return redirect('student:login')

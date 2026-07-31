import logging
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.utils import timezone
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Helper to verify staff or fallback to admin/authenticated
def is_staff_user(user):
    return user.is_staff or user.is_superuser

# ----------------------------------------------------------------
# AUTHENTICATION
# ----------------------------------------------------------------

def staff_login(request):
    if request.user.is_authenticated:
        return redirect('staff_dashboard')
        
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')
        
        if not username or not password:
            messages.error(request, 'Please provide both username/email and password.')
            return render(request, 'staff_login.html', {'username': username})
            
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, f'Welcome back, {user.first_name or user.username}!')
            return redirect('staff_dashboard')
        else:
            # Let's support a guest login for demo convenience if no admin is setup yet
            if username == 'staff' and password == 'password123':
                # Dynamically create or fetch the guest staff user if not exists
                user, created = User.objects.get_or_create(username='staff', is_staff=True)
                if created:
                    user.set_password('password123')
                    user.first_name = "Sarah"
                    user.last_name = "Jenkins"
                    user.email = "sarah.jenkins@school.edu"
                    user.save()
                user = authenticate(request, username='staff', password='password123')
                login(request, user)
                messages.success(request, 'Welcome to the Staff Portal (Guest Mode)!')
                return redirect('staff_dashboard')
                
            messages.error(request, 'Invalid credentials. Use "staff" & "password123" for demo.')
            return render(request, 'staff_login.html', {'username': username})
            
    return render(request, 'staff_login.html')

def staff_logout(request):
    logout(request)
    messages.success(request, 'Successfully logged out.')
    return redirect('staff_login')

def staff_forget_password(request):
    if request.method == 'POST':
        email = request.POST.get('email', '').strip()
        if not email:
            messages.error(request, 'Please enter your registered email address.')
            return render(request, 'staff_forgot_password.html')
            
        # Simulate sending email link
        messages.success(request, 'Password reset instructions have been sent to your email.')
        # In a real environment, we'd generate a link using token. For demo, redirect to reset:
        # We find a staff user or use guest 'staff'
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            try:
                user = User.objects.get(username='staff')
            except User.DoesNotExist:
                user = User.objects.create(username='staff', email=email, is_staff=True)
                user.set_password('password123')
                user.save()
        
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        return redirect('staff_reset_pass', uidb64=uid, token=token)
        
    return render(request, 'staff_forgot_password.html')

def staff_reset_pass(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
        
    if user is None or not default_token_generator.check_token(user, token):
        messages.error(request, 'Invalid or expired password reset link.')
        return redirect('staff_forget_password')
        
    if request.method == 'POST':
        new_password = request.POST.get('new_password', '')
        confirm_password = request.POST.get('confirm_password', '')
        
        if len(new_password) < 8:
            messages.error(request, 'Password must be at least 8 characters long.')
            return render(request, 'staff_reset_password.html')
            
        if new_password != confirm_password:
            messages.error(request, 'Passwords do not match.')
            return render(request, 'staff_reset_password.html')
            
        user.set_password(new_password)
        user.save()
        messages.success(request, 'Your password has been successfully reset. Please log in.')
        return redirect('staff_login')
        
    return render(request, 'staff_reset_password.html', {'uidb64': uidb64, 'token': token})

# ----------------------------------------------------------------
# DASHBOARD & PAGES (Using login_required & Mock/Actual Data Mix)
# ----------------------------------------------------------------

@login_required(login_url='staff_login')
def staff_dashboard(request):
    # Quick statistics
    stats = {
        'total_students': 142,
        'active_courses': 4,
        'attendance_today': '94.2%',
        'pending_reviews': 18,
        'open_tickets': 3
    }
    
    # Recent Activities
    activities = [
        {'time': '10 mins ago', 'desc': 'Marked student attendance for Advanced Physics (Class A)', 'type': 'attendance'},
        {'time': '2 hours ago', 'desc': 'Uploaded study material: "Lecture 8 - Quantum Superposition"', 'type': 'material'},
        {'time': 'Yesterday', 'desc': 'Reviewed and graded 12 submissions for "Lab Report 2"', 'type': 'review'},
        {'time': '2 days ago', 'desc': 'Created a new test: "Midterm Exam - Electromagnetic Waves"', 'type': 'test'},
    ]
    
    # Upcoming sessions
    sessions = [
        {'time': '09:00 AM - 10:30 AM', 'course': 'Advanced Physics', 'room': 'Lab 3B', 'class': 'Year 2 Sec A'},
        {'time': '11:00 AM - 12:30 PM', 'course': 'Computational Mechanics', 'room': 'Hall 4', 'class': 'Year 3 Sec B'},
        {'time': '02:00 PM - 03:30 PM', 'course': 'Quantum Field Theory', 'room': 'Room 102', 'class': 'Year 4 Sec A'},
    ]

    return render(request, 'Dashboard.html', {
        'stats': stats,
        'activities': activities,
        'sessions': sessions,
        'user': request.user
    })

@login_required(login_url='staff_login')
def view_courses(request):
    courses = [
        {'code': 'PHY-401', 'name': 'Advanced Quantum Mechanics', 'students': 38, 'credits': 4, 'progress': 75},
        {'code': 'PHY-302', 'name': 'Electrodynamics II', 'students': 45, 'credits': 3, 'progress': 60},
        {'code': 'PHY-201', 'name': 'Thermodynamics & Statistical Physics', 'students': 59, 'credits': 4, 'progress': 85},
        {'code': 'PHY-505', 'name': 'Relativistic Astrophysics', 'students': 12, 'credits': 3, 'progress': 40},
    ]
    return render(request, 'View_Courses.html', {'courses': courses})

@login_required(login_url='staff_login')
def study_materials(request):
    materials = [
        {'title': 'Quantum Mechanics Lecture Notes Week 6', 'course': 'Advanced Quantum Mechanics', 'date': '2026-05-20', 'size': '4.2 MB', 'downloads': 34},
        {'title': 'Electromagnetism Simulator Config File', 'course': 'Electrodynamics II', 'date': '2026-05-18', 'size': '256 KB', 'downloads': 41},
        {'title': 'Thermodynamics Problem Sheet 3 Solutions', 'course': 'Thermodynamics & Statistical Physics', 'date': '2026-05-12', 'size': '1.8 MB', 'downloads': 58},
    ]
    if request.method == 'POST':
        title = request.POST.get('title')
        course = request.POST.get('course')
        file_obj = request.FILES.get('file')
        if title and course:
            size_str = f"{file_obj.size / (1024*1024):.1f} MB" if file_obj else "1.5 MB"
            materials.insert(0, {
                'title': title,
                'course': course,
                'date': timezone.now().strftime('%Y-%m-%d'),
                'size': size_str,
                'downloads': 0
            })
            messages.success(request, 'Study material uploaded successfully!')
            
    return render(request, 'Study_Materials.html', {'materials': materials})

@login_required(login_url='staff_login')
def session_creation(request):
    sessions = [
        {'id': 1, 'title': 'Weekly Discussion: Wavefront Mechanics', 'course': 'Advanced Quantum Mechanics', 'date': '2026-05-28', 'time': '10:00 AM', 'duration': '90 mins', 'platform': 'Room 302 / Zoom'},
        {'id': 2, 'title': 'Review Session: Boundary Value Problems', 'course': 'Electrodynamics II', 'date': '2026-05-29', 'time': '02:00 PM', 'duration': '60 mins', 'platform': 'Lecture Hall C'},
    ]
    if request.method == 'POST':
        title = request.POST.get('title')
        course = request.POST.get('course')
        date = request.POST.get('date')
        time = request.POST.get('time')
        duration = request.POST.get('duration')
        platform = request.POST.get('platform')
        
        if title and course and date:
            sessions.insert(0, {
                'id': len(sessions) + 1,
                'title': title,
                'course': course,
                'date': date,
                'time': time or '12:00 PM',
                'duration': f"{duration} mins" if duration else '60 mins',
                'platform': platform or 'Zoom Link'
            })
            messages.success(request, 'New teaching session scheduled successfully!')
            
    return render(request, 'Session_Create.html', {'sessions': sessions})

@login_required(login_url='staff_login')
def student_details(request):
    students = [
        {'id': 'STU-9901', 'name': 'Aditya Sharma', 'email': 'aditya.sharma@school.edu', 'class': 'Year 2 Sec A', 'attendance': '96%', 'gpa': '3.85', 'status': 'Excellent'},
        {'id': 'STU-9902', 'name': 'Brian O\'Connor', 'email': 'brian.oc@school.edu', 'class': 'Year 2 Sec A', 'attendance': '89%', 'gpa': '3.20', 'status': 'Average'},
        {'id': 'STU-9903', 'name': 'Chitrangada Sen', 'email': 'chitrangada.s@school.edu', 'class': 'Year 3 Sec B', 'attendance': '98%', 'gpa': '3.92', 'status': 'Excellent'},
        {'id': 'STU-9904', 'name': 'Dev Patel', 'email': 'dev.patel@school.edu', 'class': 'Year 3 Sec B', 'attendance': '76%', 'gpa': '2.64', 'status': 'At Risk'},
        {'id': 'STU-9905', 'name': 'Emily Watson', 'email': 'emily.w@school.edu', 'class': 'Year 4 Sec A', 'attendance': '92%', 'gpa': '3.50', 'status': 'Good'},
    ]
    
    search_query = request.GET.get('search', '').strip().lower()
    if search_query:
        students = [s for s in students if search_query in s['name'].lower() or search_query in s['id'].lower() or search_query in s['class'].lower()]
        
    return render(request, 'Student_Details.html', {'students': students, 'search_query': search_query})

@login_required(login_url='staff_login')
def class_creation(request):
    classes = [
        {'code': 'PHY-A', 'name': 'Physics Honours Year A', 'sem': 'Semester 4', 'strength': 42, 'representative': 'Aditya Sharma'},
        {'code': 'PHY-B', 'name': 'Computational Physics Year B', 'sem': 'Semester 6', 'strength': 35, 'representative': 'Chitrangada Sen'},
    ]
    if request.method == 'POST':
        name = request.POST.get('name')
        code = request.POST.get('code')
        sem = request.POST.get('semester')
        rep = request.POST.get('representative')
        
        if name and code:
            classes.insert(0, {
                'code': code,
                'name': name,
                'sem': sem or 'Semester 1',
                'strength': 0,
                'representative': rep or 'TBD'
            })
            messages.success(request, f'Class group {code} has been successfully created!')
            
    return render(request, 'classes.html', {'classes': classes})

@login_required(login_url='staff_login')
def test_creation(request):
    tests = [
        {'id': 101, 'title': 'Quiz 2: Electrodynamics Refraction', 'course': 'Electrodynamics II', 'date': '2026-05-27', 'duration': '45 mins', 'total_marks': 30, 'questions_count': 15},
        {'id': 102, 'title': 'Midterm: Advanced Statistical Mechanics', 'course': 'Thermodynamics & Statistical Physics', 'date': '2026-06-05', 'duration': '120 mins', 'total_marks': 100, 'questions_count': 10},
    ]
    if request.method == 'POST':
        title = request.POST.get('title')
        course = request.POST.get('course')
        date = request.POST.get('date')
        duration = request.POST.get('duration')
        marks = request.POST.get('marks')
        q_count = request.POST.get('questions_count')
        
        if title and course:
            tests.insert(0, {
                'id': len(tests) + 101,
                'title': title,
                'course': course,
                'date': date or '2026-06-01',
                'duration': f"{duration} mins" if duration else '60 mins',
                'total_marks': int(marks) if marks else 50,
                'questions_count': int(q_count) if q_count else 10
            })
            messages.success(request, 'New assessment created successfully!')
            
    return render(request, 'Test_Creation.html', {'tests': tests})

@login_required(login_url='staff_login')
def notifications(request):
    notifs = [
        {'id': 1, 'title': 'Staff Meeting: Curriculum Updates', 'sender': 'Principal Office', 'date': 'Today, 10:15 AM', 'body': 'All science faculty staff are requested to attend the curriculum alignment meeting in Conference Room 1 at 3 PM today.', 'important': True},
        {'id': 2, 'title': 'Server Maintenance Notice', 'sender': 'IT Department', 'date': 'Yesterday, 04:30 PM', 'body': 'The school LMS portal will undergo scheduled maintenance on Saturday between 02:00 AM to 04:00 AM. Access will be temporarily unavailable.', 'important': False},
        {'id': 3, 'title': 'Submission Deadline Extended', 'sender': 'Dean Academics', 'date': '2 days ago', 'body': 'The deadline for submission of mid-semester final marks is extended to Friday, 29th May at 5:00 PM.', 'important': True},
    ]
    if request.method == 'POST':
        title = request.POST.get('title')
        body = request.POST.get('body')
        target = request.POST.get('target')
        is_imp = request.POST.get('important') == 'on'
        
        if title and body:
            notifs.insert(0, {
                'id': len(notifs) + 1,
                'title': f"[To: {target or 'All'}] {title}",
                'sender': 'You (Staff Panel)',
                'date': 'Just now',
                'body': body,
                'important': is_imp
            })
            messages.success(request, 'Broadcast announcement published successfully!')
            
    return render(request, 'Notifications.html', {'notifications': notifs})

@login_required(login_url='staff_login')
def tasks_reviews(request):
    submissions = [
        {'id': 1, 'student': 'Aditya Sharma', 'roll': 'STU-9901', 'task_title': 'Electromagnetism Lab Report 2', 'submitted_on': '2026-05-24', 'file': 'lab_report_aditya.pdf', 'status': 'Pending', 'grade': None, 'review': ''},
        {'id': 2, 'student': 'Brian O\'Connor', 'roll': 'STU-9902', 'task_title': 'Electromagnetism Lab Report 2', 'submitted_on': '2026-05-23', 'file': 'brian_oc_rep.pdf', 'status': 'Graded', 'grade': 'A-', 'review': 'Well detailed report. Analysis of boundary values is excellent.'},
        {'id': 3, 'student': 'Chitrangada Sen', 'roll': 'STU-9903', 'task_title': 'Quantum Superposition Proofs', 'submitted_on': '2026-05-24', 'file': 'csen_qsuper.pdf', 'status': 'Pending', 'grade': None, 'review': ''},
    ]
    if request.method == 'POST':
        sub_id = int(request.POST.get('sub_id', 0))
        grade = request.POST.get('grade')
        review = request.POST.get('review')
        
        for sub in submissions:
            if sub['id'] == sub_id:
                sub['grade'] = grade
                sub['review'] = review
                sub['status'] = 'Graded'
                messages.success(request, f"Review submitted for {sub['student']}!")
                break
                
    return render(request, 'task submit&result.html', {'submissions': submissions})

@login_required(login_url='staff_login')
def attendance_staff(request):
    attendance_records = [
        {'date': '2026-05-25', 'check_in': '08:45 AM', 'check_out': '05:15 PM', 'status': 'Present', 'hours': '8.5 hrs'},
        {'date': '2026-05-24', 'check_in': '08:52 AM', 'check_out': '05:08 PM', 'status': 'Present', 'hours': '8.2 hrs'},
        {'date': '2026-05-23', 'check_in': '08:40 AM', 'check_out': '05:30 PM', 'status': 'Present', 'hours': '8.8 hrs'},
        {'date': '2026-05-22', 'check_in': '---', 'check_out': '---', 'status': 'Weekend / Holiday', 'hours': '0 hrs'},
    ]
    checked_in = request.session.get('staff_checked_in', False)
    check_in_time = request.session.get('staff_check_in_time', None)
    
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'check_in':
            request.session['staff_checked_in'] = True
            request.session['staff_check_in_time'] = timezone.now().strftime('%I:%M %p')
            messages.success(request, 'Checked in successfully at ' + request.session['staff_check_in_time'])
        elif action == 'check_out':
            in_time = request.session.get('staff_check_in_time', '09:00 AM')
            out_time = timezone.now().strftime('%I:%M %p')
            request.session['staff_checked_in'] = False
            request.session['staff_check_in_time'] = None
            
            attendance_records.insert(0, {
                'date': timezone.now().strftime('%Y-%m-%d'),
                'check_in': in_time,
                'check_out': out_time,
                'status': 'Present',
                'hours': '8.0 hrs (Est)'
            })
            messages.success(request, f'Checked out successfully at {out_time}. Attendance recorded!')
            
        return redirect('staff_attendance_staff')
        
    return render(request, 'Attendance_staff .html', {
        'records': attendance_records,
        'checked_in': checked_in,
        'check_in_time': check_in_time
    })

@login_required(login_url='staff_login')
def attendance_students(request):
    students = [
        {'id': 'STU-9901', 'name': 'Aditya Sharma', 'status': 'present'},
        {'id': 'STU-9902', 'name': 'Brian O\'Connor', 'status': 'present'},
        {'id': 'STU-9903', 'name': 'Chitrangada Sen', 'status': 'present'},
        {'id': 'STU-9904', 'name': 'Dev Patel', 'status': 'absent'},
        {'id': 'STU-9905', 'name': 'Emily Watson', 'status': 'present'},
    ]
    if request.method == 'POST':
        # Processing student attendance submission
        for s in students:
            status_val = request.POST.get(f"status_{s['id']}")
            if status_val:
                s['status'] = status_val
        messages.success(request, 'Student attendance registered successfully for today!')
        
    return render(request, 'mark_Attend_student.html', {'students': students, 'today': timezone.now().strftime('%Y-%m-%d')})

@login_required(login_url='staff_login')
def tickets_handling(request):
    tickets = [
        {'id': 'TCK-201', 'student': 'Dev Patel', 'subject': 'LMS File Upload Failing', 'category': 'Technical Support', 'status': 'Open', 'created_at': '2026-05-24', 'messages': [{'sender': 'Student', 'text': 'I keep getting 413 Payload Too Large when uploading my 15MB video assignment.'}]},
        {'id': 'TCK-202', 'student': 'Brian O\'Connor', 'subject': 'Midterm Attendance Correction', 'category': 'Attendance', 'status': 'Open', 'created_at': '2026-05-23', 'messages': [{'sender': 'Student', 'text': 'I was present during the midterm but marked absent. Please verify.'}]},
        {'id': 'TCK-203', 'student': 'Emily Watson', 'subject': 'Doubt regarding Assignment 3 Q4', 'category': 'Academics', 'status': 'Resolved', 'created_at': '2026-05-21', 'messages': [{'sender': 'Student', 'text': 'Is the wave function normalized in Q4?'}, {'sender': 'Teacher', 'text': 'Yes, assume normalization.'}]},
    ]
    
    if request.method == 'POST':
        ticket_id = request.POST.get('ticket_id')
        reply_text = request.POST.get('reply')
        resolve = request.POST.get('resolve') == 'true'
        
        for t in tickets:
            if t['id'] == ticket_id:
                if reply_text:
                    t['messages'].append({'sender': 'Teacher', 'text': reply_text})
                if resolve:
                    t['status'] = 'Resolved'
                messages.success(request, f'Ticket {ticket_id} updated successfully!')
                break
                
    return render(request, 'tickets_handling.html', {'tickets': tickets})

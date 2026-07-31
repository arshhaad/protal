from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('login/', views.staff_login, name='staff_login'),
    path('logout/', views.staff_logout, name='staff_logout'),
    path('forget-password/', views.staff_forget_password, name='staff_forget_password'),
    path('reset-password/<uidb64>/<token>/', views.staff_reset_pass, name='staff_reset_pass'),

    # Dashboard & Pages
    path('dashboard/', views.staff_dashboard, name='staff_dashboard'),
    path('courses/', views.view_courses, name='staff_view_courses'),
    path('study-materials/', views.study_materials, name='staff_study_materials'),
    path('session-creation/', views.session_creation, name='staff_session_creation'),
    path('student-details/', views.student_details, name='staff_student_details'),
    path('class-creation/', views.class_creation, name='staff_class_creation'),
    path('test-creation/', views.test_creation, name='staff_test_creation'),
    path('notifications/', views.notifications, name='staff_notifications'),
    path('tasks-reviews/', views.tasks_reviews, name='staff_tasks_reviews'),
    path('attendance-staff/', views.attendance_staff, name='staff_attendance_staff'),
    path('attendance-students/', views.attendance_students, name='staff_attendance_students'),
    path('tickets/', views.tickets_handling, name='staff_tickets_handling'),
]

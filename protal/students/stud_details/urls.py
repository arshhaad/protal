from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.profile, name='profile'),
    path('exam-details/', views.exam_details, name='exam_details'),
    path('marks/', views.marks, name='marks'),
    path('attendance/', views.attendance, name='attendance'),
    path('sessions/', views.sessions, name='sessions'),
    path('my-courses/', views.my_courses, name='my_courses'),
    path('student-progress/', views.student_progress, name='student_progress'),
    path('tasks/', views.tasks, name='tasks'),
    path('leave-request/', views.leave_request, name='leave_request'),
    path('payment/', views.payment, name='payment'),
    path('notifications/', views.notifications, name='notifications'),
    path('tickets/', views.tickets, name='tickets'),
    path('contact-us/', views.contact_us, name='contact_us'),
]

from django.urls import path
from . import api_views as v
from . import admin_api_views as a

# ── Student API endpoints ──────────────────────────────────
student_patterns = [
    # Auth
    path('auth/login/',          v.StudentLoginView.as_view(),          name='api_student_login'),
    path('auth/logout/',         v.StudentLogoutView.as_view(),         name='api_student_logout'),
    path('auth/forgot-password/',v.StudentForgotPasswordView.as_view(), name='api_student_forgot'),
    path('auth/reset-password/', v.StudentResetPasswordView.as_view(),  name='api_student_reset'),

    # Dashboard
    path('dashboard/',           v.StudentDashboardView.as_view(),      name='api_student_dashboard'),

    # Profile
    path('profile/',             v.StudentProfileView.as_view(),        name='api_student_profile'),

    # Academic
    path('courses/',             v.StudentCourseListView.as_view(),     name='api_student_courses'),
    path('materials/',           v.StudentMaterialListView.as_view(),   name='api_student_materials'),
    path('exams/',               v.StudentExamListView.as_view(),       name='api_student_exams'),
    path('marks/',               v.StudentMarkListView.as_view(),       name='api_student_marks'),
    path('attendance/',          v.StudentAttendanceView.as_view(),     name='api_student_attendance'),
    path('sessions/',            v.StudentSessionListView.as_view(),    name='api_student_sessions'),
    path('progress/',            v.StudentDashboardView.as_view(),      name='api_student_progress'),

    # Tasks
    path('tasks/',               v.StudentTaskListView.as_view(),       name='api_student_tasks'),
    path('tasks/submit/',        v.StudentTaskSubmitView.as_view(),     name='api_student_task_submit'),
    path('submissions/',         v.StudentSubmissionListView.as_view(), name='api_student_submissions'),

    # Leave
    path('leave/',               v.StudentLeaveRequestView.as_view(),   name='api_student_leave'),

    # Payments
    path('payments/',            v.StudentPaymentView.as_view(),        name='api_student_payments'),

    # Notifications
    path('notifications/',       v.StudentNotificationListView.as_view(), name='api_student_notifs'),
    path('notifications/<int:pk>/read/', v.StudentNotificationMarkReadView.as_view(), name='api_student_notif_read'),
    path('notifications/read-all/',      v.StudentNotificationMarkReadView.as_view(), name='api_student_notif_all'),

    # Tickets
    path('tickets/',             v.StudentTicketView.as_view(),         name='api_student_tickets'),

    # Contact
    path('contact/',             v.StudentContactView.as_view(),        name='api_student_contact'),
]

# ── Admin API endpoints ────────────────────────────────────
admin_patterns = [
    # Auth
    path('auth/login/',          a.AdminLoginView.as_view(),            name='api_admin_login'),
    path('auth/signup/',         a.AdminSignupView.as_view(),           name='api_admin_signup'),
    path('auth/logout/',         a.AdminLogoutView.as_view(),           name='api_admin_logout'),
    path('auth/forgot-password/',a.AdminForgotPasswordView.as_view(),   name='api_admin_forgot'),
    path('auth/reset-password/', a.AdminResetPasswordView.as_view(),    name='api_admin_reset'),

    # Dashboard
    path('dashboard/',           a.AdminDashboardView.as_view(),        name='api_admin_dashboard'),

    # Courses
    path('courses/',             a.AdminCourseListCreateView.as_view(), name='api_admin_courses'),
    path('courses/<int:pk>/',    a.AdminCourseDetailView.as_view(),     name='api_admin_course_detail'),

    # Students
    path('students/',            a.AdminStudentListView.as_view(),      name='api_admin_students'),
    path('students/create/',     a.AdminCreateStudentView.as_view(),    name='api_admin_student_create'),
    path('students/<int:pk>/',   a.AdminStudentDetailView.as_view(),    name='api_admin_student_detail'),
    path('students/<int:pk>/deactivate/', a.AdminDeactivateStudentView.as_view(), name='api_admin_student_deactivate'),

    # Staff
    path('staff/',               a.AdminStaffListView.as_view(),        name='api_admin_staff'),
    path('staff/create/',        a.AdminCreateStaffView.as_view(),      name='api_admin_staff_create'),
    path('staff/<int:pk>/deactivate/', a.AdminDeactivateStaffView.as_view(), name='api_admin_staff_deactivate'),

    # Head Masters
    path('hm/',                  a.AdminHMListView.as_view(),            name='api_admin_hm'),
    path('hm/create/',           a.AdminCreateHMView.as_view(),           name='api_admin_hm_create'),

    # Events
    path('events/',              a.AdminEventView.as_view(),            name='api_admin_events'),
    path('events/<int:pk>/',     a.AdminEventDetailView.as_view(),      name='api_admin_event_detail'),

    # Communication
    path('messages/send/',       a.AdminSendMessageView.as_view(),      name='api_admin_send_msg'),

    # Reports
    path('reports/students/',    a.AdminStudentReportView.as_view(),    name='api_admin_report_students'),
    path('reports/staff/',       a.AdminStaffReportView.as_view(),      name='api_admin_report_staff'),
    path('reports/courses/',     a.AdminCourseReportView.as_view(),     name='api_admin_report_courses'),

    # Payments
    path('payments/',            a.AdminFeeTransactionListCreateView.as_view(), name='api_admin_payments'),
    path('payments/summary/',    a.AdminFeeSummaryView.as_view(),               name='api_admin_fee_summary'),
]

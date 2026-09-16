from django.urls import path
from . import api_views as v

staff_patterns = [
    # Auth
    path('auth/login/',           v.StaffLoginView.as_view(),               name='api_staff_login'),
    path('auth/logout/',          v.StaffLogoutView.as_view(),              name='api_staff_logout'),
    path('auth/forgot-password/', v.StaffForgotPasswordView.as_view(),      name='api_staff_forgot'),
    path('auth/reset-password/',  v.StaffResetPasswordView.as_view(),       name='api_staff_reset'),

    # Dashboard
    path('dashboard/',            v.StaffDashboardView.as_view(),           name='api_staff_dashboard'),

    # Courses & materials
    path('courses/',              v.StaffCourseListView.as_view(),          name='api_staff_courses'),
    path('materials/',            v.StaffMaterialListCreateView.as_view(),  name='api_staff_materials'),
    path('materials/<int:pk>/',   v.StaffMaterialDetailView.as_view(),      name='api_staff_material_detail'),

    # Sessions
    path('sessions/',             v.StaffSessionListCreateView.as_view(),   name='api_staff_sessions'),
    path('sessions/<int:pk>/',    v.StaffSessionDetailView.as_view(),       name='api_staff_session_detail'),

    # Students
    path('students/',             v.StaffStudentListView.as_view(),         name='api_staff_students'),

    # Classes
    path('classes/',              v.StaffClassGroupView.as_view(),          name='api_staff_classes'),
    path('classes/<int:pk>/',     v.StaffClassGroupDetailView.as_view(),    name='api_staff_class_detail'),

    # Assessments
    path('assessments/',          v.StaffAssessmentView.as_view(),          name='api_staff_assessments'),
    path('assessments/<int:pk>/', v.StaffAssessmentDetailView.as_view(),    name='api_staff_assessment_detail'),

    # Tasks & submissions
    path('tasks/',                v.StaffTaskListCreateView.as_view(),      name='api_staff_tasks'),
    path('submissions/',          v.StaffSubmissionListView.as_view(),      name='api_staff_submissions'),
    path('submissions/<int:pk>/grade/', v.StaffGradeSubmissionView.as_view(), name='api_staff_grade'),

    # Staff attendance
    path('attendance/self/',      v.StaffSelfAttendanceView.as_view(),      name='api_staff_att_self'),
    path('attendance/checkin/',   v.StaffCheckInView.as_view(),             name='api_staff_checkin'),
    path('attendance/checkout/',  v.StaffCheckOutView.as_view(),            name='api_staff_checkout'),

    # Student attendance
    path('attendance/students/',  v.StaffMarkStudentAttendanceView.as_view(), name='api_staff_att_students'),

    # Leave reviews
    path('leave/',                v.StaffLeaveRequestListView.as_view(),    name='api_staff_leave_list'),
    path('leave/<int:pk>/review/',v.StaffLeaveReviewView.as_view(),         name='api_staff_leave_review'),

    # Tickets
    path('tickets/',              v.StaffTicketListView.as_view(),          name='api_staff_tickets'),
    path('tickets/<int:pk>/reply/', v.StaffTicketReplyView.as_view(),       name='api_staff_ticket_reply'),
    path('tickets/<int:pk>/status/', v.StaffTicketStatusView.as_view(),     name='api_staff_ticket_status'),

    # Notifications & broadcast
    path('notifications/',        v.StaffNotificationView.as_view(),        name='api_staff_notifs'),
    path('broadcast/',            v.StaffBroadcastView.as_view(),           name='api_staff_broadcast'),

    # Events
    path('events/',               v.StaffEventListView.as_view(),           name='api_staff_events'),
]

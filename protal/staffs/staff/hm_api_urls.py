from django.urls import path
from . import hm_api_views as v

hm_patterns = [
    # Auth
    path('auth/login/',           v.HMLoginView.as_view(),                name='api_hm_login'),
    path('auth/signup/',          v.HMSignupView.as_view(),               name='api_hm_signup'),
    path('auth/logout/',          v.HMLogoutView.as_view(),               name='api_hm_logout'),

    # Dashboard
    path('dashboard/',            v.HMDashboardView.as_view(),            name='api_hm_dashboard'),

    # Staff oversight & attendance
    path('staff/',                          v.HMStaffListCreateView.as_view(),        name='api_hm_staff'),
    path('staff/<int:pk>/',                 v.HMStaffDetailView.as_view(),            name='api_hm_staff_detail'),
    path('staff-attendance/',               v.HMStaffAttendanceListView.as_view(),    name='api_hm_staff_attendance'),
    path('staff-attendance/<int:pk>/',      v.HMStaffAttendanceDetailView.as_view(),  name='api_hm_staff_attendance_detail'),

    # Student performance
    path('students/performance/', v.HMStudentPerformanceView.as_view(),   name='api_hm_student_perf'),

    # Classes & curriculum
    path('classes/',              v.HMClassesView.as_view(),              name='api_hm_classes'),

    # Leave approvals
    path('leave-requests/',                 v.HMLeaveRequestListView.as_view(), name='api_hm_leave_list'),
    path('leave-requests/<int:pk>/approve/',v.HMLeaveApproveView.as_view(),     name='api_hm_leave_approve'),
    path('leave-requests/<int:pk>/reject/', v.HMLeaveRejectView.as_view(),      name='api_hm_leave_reject'),

    # Announcements
    path('announcements/',                  v.HMAnnouncementListCreateView.as_view(), name='api_hm_announcements'),
    path('announcements/<int:pk>/',         v.HMAnnouncementDetailView.as_view(),     name='api_hm_announcement_detail'),

    # Academic reports
    path('academic-reports/',               v.HMAcademicReportsView.as_view(),        name='api_hm_reports'),

    # Tickets / grievances
    path('tickets/',                        v.HMTicketListView.as_view(),             name='api_hm_tickets'),
    path('tickets/<int:pk>/reply/',         v.HMTicketReplyView.as_view(),            name='api_hm_ticket_reply'),
    path('tickets/<int:pk>/close/',         v.HMTicketCloseView.as_view(),            name='api_hm_ticket_close'),
]

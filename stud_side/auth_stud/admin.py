from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser, ContactQuery, Course, Exam, Session, 
    LeaveRequest, Mark, Notification, Payment, Progress, 
    Task, Ticket, Attendance
)

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'enroll_id', 'full_name', 'email', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Student Profile Info', {
            'fields': (
                'enroll_id', 'full_name', 'phone', 'avatar', 'grade', 
                'class_section', 'date_of_birth', 'address', 
                'guardian_name', 'guardian_phone'
            )
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Student Profile Info', {
            'fields': (
                'enroll_id', 'full_name', 'phone', 'avatar', 'grade', 
                'class_section', 'date_of_birth', 'address', 
                'guardian_name', 'guardian_phone'
            )
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(ContactQuery)
admin.site.register(Course)
admin.site.register(Exam)
admin.site.register(Session)
admin.site.register(LeaveRequest)
admin.site.register(Mark)
admin.site.register(Notification)
admin.site.register(Payment)
admin.site.register(Progress)
admin.site.register(Task)
admin.site.register(Ticket)
admin.site.register(Attendance)


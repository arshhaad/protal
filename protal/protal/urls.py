from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect

from students.stud_details.api_urls import student_patterns, admin_patterns
from staffs.staff.api_urls import staff_patterns

urlpatterns = [
    # ── Root ───────────────────────────────────────────────
    path('', lambda request: redirect('login', permanent=False)),

    # ── Django Admin ───────────────────────────────────────
    path('django-admin/', admin.site.urls),

    # ── Django template views (existing) ──────────────────
    path('student/', include('students.auth_stud.urls')),
    path('student/', include('students.stud_details.urls')),
    path('staff/',   include('staffs.staff.urls')),

    # ── REST API v1 ────────────────────────────────────────
    path('api/v1/student/', include((student_patterns, 'student_api'))),
    path('api/v1/staff/',   include((staff_patterns,   'staff_api'))),
    path('api/v1/admin/',   include((admin_patterns,   'admin_api'))),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

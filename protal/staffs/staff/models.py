from django.db import models
from django.contrib.auth.models import User


class StaffProfile(models.Model):
    user        = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    department  = models.CharField(max_length=100, blank=True)
    phone       = models.CharField(max_length=15, blank=True)
    designation = models.CharField(max_length=100, blank=True)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'Staff Profile'
        verbose_name_plural = 'Staff Profiles'

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} – {self.department}"


class ClassGroup(models.Model):
    code        = models.CharField(max_length=20, unique=True)
    name        = models.CharField(max_length=100)
    semester    = models.CharField(max_length=20, blank=True)
    class_teacher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['code']

    def __str__(self):
        return f"{self.code} – {self.name}"


class StaffAttendance(models.Model):
    STATUS_CHOICES = [('present', 'Present'), ('absent', 'Absent'), ('half_day', 'Half Day')]

    staff       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='staff_attendance')
    date        = models.DateField()
    check_in    = models.TimeField(null=True, blank=True)
    check_out   = models.TimeField(null=True, blank=True)
    status      = models.CharField(max_length=10, choices=STATUS_CHOICES, default='absent')
    total_hours = models.CharField(max_length=10, blank=True)

    class Meta:
        ordering = ['-date']
        unique_together = ['staff', 'date']

    def __str__(self):
        return f"{self.staff.username} – {self.date} – {self.status}"


class Assessment(models.Model):
    title        = models.CharField(max_length=200)
    course       = models.ForeignKey('stud_details.Course', on_delete=models.CASCADE, related_name='assessments')
    class_name   = models.CharField(max_length=50)
    scheduled_at = models.DateTimeField()
    duration_min = models.PositiveSmallIntegerField(default=60)
    total_marks  = models.PositiveSmallIntegerField(default=100)
    created_by   = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['scheduled_at']

    def __str__(self):
        return f"{self.title} – {self.course.code}"


class Event(models.Model):
    AUDIENCE_CHOICES = [('all', 'All'), ('students', 'Students'), ('staff', 'Staff')]

    title      = models.CharField(max_length=200)
    description= models.TextField(blank=True)
    event_date = models.DateField()
    event_time = models.TimeField(null=True, blank=True)
    location   = models.CharField(max_length=200, blank=True)
    audience   = models.CharField(max_length=10, choices=AUDIENCE_CHOICES, default='all')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['event_date']

    def __str__(self):
        return f"{self.title} – {self.event_date}"

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class CustomUser(AbstractUser):
    enroll_id = models.CharField('Enrollment ID', max_length=50, unique=True)
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.FileField(upload_to='avatars/', blank=True, null=True)
    grade = models.CharField(max_length=20, blank=True, null=True)
    class_section = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    guardian_name = models.CharField(max_length=100, blank=True, null=True)
    guardian_phone = models.CharField(max_length=20, blank=True, null=True)
    # Override default ManyToMany fields to avoid reverse accessor clashes
    from django.contrib.auth.models import Group, Permission
    groups = models.ManyToManyField(
        Group,
        related_name='customuser_set',
        blank=True,
        help_text='The groups this user belongs to.'
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='customuser_set',
        blank=True,
        help_text='Specific permissions for this user.'
    )

    def __str__(self):
        return self.full_name or self.username

class ContactQuery(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Query from {self.name}"

class Course(models.Model):
    title = models.CharField(max_length=150)
    code = models.CharField(max_length=20, unique=True)
    teacher_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    textbook_title = models.CharField(max_length=150)
    pdf_file = models.FileField(upload_to='textbooks/', blank=True, null=True)
    cover_image = models.FileField(upload_to='covers/', blank=True, null=True)

    def __str__(self):
        return f"{self.code} - {self.title}"

class Exam(models.Model):
    title = models.CharField(max_length=100)
    subject = models.CharField(max_length=100)
    date = models.DateField()
    time = models.TimeField()
    duration_minutes = models.IntegerField(default=180)
    venue = models.CharField(max_length=100)
    instructions = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title

class Session(models.Model):
    class_name = models.CharField(max_length=100)
    subject = models.CharField(max_length=100)
    teacher_name = models.CharField(max_length=100)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    link_or_room = models.CharField(max_length=200, help_text="Online class link or physical room number")

    def __str__(self):
        return f"{self.class_name} - {self.subject}"

class LeaveRequest(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='leave_requests')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    applied_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} - {self.start_date} to {self.end_date}"

class Mark(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='marks')
    subject = models.CharField(max_length=100)
    exam_name = models.CharField(max_length=100, help_text="e.g. Mid-Term, Final Exam")
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    max_marks = models.DecimalField(max_digits=5, decimal_places=2, default=100.0)
    remarks = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return f"{self.student.username} - {self.subject} ({self.exam_name})"

class Notification(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notifications', 
        blank=True, 
        null=True, 
        help_text="Leave blank for global school-wide notifications"
    )
    title = models.CharField(max_length=150)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Payment(models.Model):
    STATUS_CHOICES = [
        ('Paid', 'Paid'),
        ('Unpaid', 'Unpaid'),
    ]
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    title = models.CharField(max_length=150, help_text="e.g. Term Tuition Fee, Exam Fee")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Unpaid')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    paid_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.student.username} - {self.title}"

class Progress(models.Model):
    student = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress')
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    marks_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    overall_status = models.CharField(max_length=100, default='Good Standing')

    def __str__(self):
        return f"Progress for {self.student.username}"

class Task(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateField()
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class Ticket(models.Model):
    CATEGORY_CHOICES = [
        ('Academic', 'Academic'),
        ('Administrative', 'Administrative'),
        ('Technical', 'Technical'),
        ('Payment', 'Payment'),
        ('Other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
    ]
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tickets')
    subject = models.CharField(max_length=150)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Technical')
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Ticket #{self.id} - {self.subject}"

class Attendance(models.Model):
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
    ]
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Present')
    remark = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        unique_together = ('student', 'date')

    def __str__(self):
        return f"{self.student.username} on {self.date} ({self.status})"

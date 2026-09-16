from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class StudentProfile(models.Model):
    GENDER_CHOICES = [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]

    user           = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    enroll_id      = models.CharField(max_length=50, unique=True, db_index=True)
    phone          = models.CharField(max_length=15, blank=True)
    dob            = models.DateField(null=True, blank=True)
    gender         = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    address        = models.TextField(blank=True)
    class_name     = models.CharField(max_length=50, blank=True)
    section        = models.CharField(max_length=10, blank=True)
    roll_no        = models.CharField(max_length=10, blank=True)
    semester       = models.PositiveSmallIntegerField(default=1)
    guardian       = models.CharField(max_length=100, blank=True)
    guardian_phone = models.CharField(max_length=15, blank=True)
    profile_pic    = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Student Profile'
        verbose_name_plural = 'Student Profiles'
        ordering            = ['enroll_id']

    def __str__(self):
        return f"{self.enroll_id} — {self.user.get_full_name() or self.user.username}"

    @property
    def full_name(self):
        return self.user.get_full_name() or self.user.username

    @property
    def dob_iso(self):
        return self.dob.strftime('%Y-%m-%d') if self.dob else ''


class Course(models.Model):
    code        = models.CharField(max_length=20, unique=True)
    name        = models.CharField(max_length=100)
    instructor  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='courses_taught')
    class_name  = models.CharField(max_length=50, blank=True)
    credit_hours= models.PositiveSmallIntegerField(default=3)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['code']

    def __str__(self):
        return f"{self.code} – {self.name}"


class StudyMaterial(models.Model):
    course        = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
    title         = models.CharField(max_length=200)
    file          = models.FileField(upload_to='study_materials/')
    file_size     = models.CharField(max_length=20, blank=True)
    download_count= models.PositiveIntegerField(default=0)
    uploaded_by   = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.title} ({self.course.code})"


class ExamSchedule(models.Model):
    class_name  = models.CharField(max_length=50)
    exam_name   = models.CharField(max_length=200)
    subject     = models.CharField(max_length=100)
    exam_date   = models.DateField()
    exam_time   = models.TimeField()
    venue       = models.CharField(max_length=100, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['exam_date', 'exam_time']

    def __str__(self):
        return f"{self.exam_name} – {self.class_name} – {self.exam_date}"


class Mark(models.Model):
    student     = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='marks')
    subject     = models.CharField(max_length=100)
    max_marks   = models.PositiveSmallIntegerField()
    scored      = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(0)])
    grade       = models.CharField(max_length=5, blank=True)
    term        = models.CharField(max_length=50, blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['subject']
        unique_together = ['student', 'subject', 'term']

    def __str__(self):
        return f"{self.student.enroll_id} – {self.subject} – {self.scored}/{self.max_marks}"

    @property
    def percentage(self):
        if self.max_marks:
            return round((float(self.scored) / self.max_marks) * 100, 1)
        return 0


class AttendanceRecord(models.Model):
    STATUS_CHOICES = [('P', 'Present'), ('A', 'Absent'), ('L', 'On Leave'), ('T', 'Late')]

    student    = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='attendance')
    date       = models.DateField()
    subject    = models.CharField(max_length=100)
    status     = models.CharField(max_length=1, choices=STATUS_CHOICES, default='P')
    remarks    = models.CharField(max_length=200, blank=True)
    marked_by  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', 'subject']
        unique_together = ['student', 'date', 'subject']

    def __str__(self):
        return f"{self.student.enroll_id} – {self.date} – {self.subject} – {self.get_status_display()}"


class Session(models.Model):
    STATUS_CHOICES = [('upcoming', 'Upcoming'), ('live', 'Live Now'), ('past', 'Past')]

    course      = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sessions')
    title       = models.CharField(max_length=200)
    class_name  = models.CharField(max_length=50)
    session_date= models.DateField()
    session_time= models.TimeField()
    duration_min= models.PositiveSmallIntegerField(default=60)
    platform    = models.CharField(max_length=100, blank=True, help_text='Zoom link or room number')
    recording   = models.URLField(blank=True)
    created_by  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['session_date', 'session_time']

    def __str__(self):
        return f"{self.title} – {self.course.code} – {self.session_date}"


class Task(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'), ('submitted', 'Submitted'), ('graded', 'Graded'), ('overdue', 'Overdue')]

    title       = models.CharField(max_length=200)
    subject     = models.CharField(max_length=100)
    class_name  = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    due_date    = models.DateTimeField()
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_tasks')
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['due_date']

    def __str__(self):
        return f"{self.title} – {self.class_name}"


class TaskSubmission(models.Model):
    task         = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='submissions')
    student      = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='task_submissions')
    file         = models.FileField(upload_to='task_submissions/', blank=True, null=True)
    notes        = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    grade        = models.CharField(max_length=10, blank=True)
    feedback     = models.TextField(blank=True)
    reviewed_by  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_submissions')
    reviewed_at  = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-submitted_at']
        unique_together = ['task', 'student']

    def __str__(self):
        return f"{self.student.enroll_id} – {self.task.title}"

    @property
    def status(self):
        if self.grade:
            return 'graded'
        return 'submitted'


class LeaveRequest(models.Model):
    LEAVE_TYPES   = [('medical', 'Medical Leave'), ('sick', 'Sick Leave'), ('family', 'Family Function'), ('personal', 'Personal')]
    STATUS_CHOICES= [('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')]

    student     = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type  = models.CharField(max_length=20, choices=LEAVE_TYPES)
    from_date   = models.DateField()
    to_date     = models.DateField()
    reason      = models.TextField()
    status      = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    applied_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.student.enroll_id} – {self.leave_type} – {self.from_date}"

    @property
    def duration(self):
        return (self.to_date - self.from_date).days + 1


class FeeTransaction(models.Model):
    STATUS_CHOICES = [('paid', 'Paid'), ('pending', 'Pending'), ('overdue', 'Overdue')]

    student     = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='fee_transactions')
    description = models.CharField(max_length=200)
    amount      = models.DecimalField(max_digits=10, decimal_places=2)
    due_date    = models.DateField(null=True, blank=True)
    paid_date   = models.DateField(null=True, blank=True)
    status      = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.enroll_id} – {self.description} – {self.amount}"


class Notification(models.Model):
    recipient    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title        = models.CharField(max_length=200)
    body         = models.TextField()
    is_read      = models.BooleanField(default=False)
    is_important = models.BooleanField(default=False)
    sent_by      = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_notifications')
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"→ {self.recipient.username}: {self.title}"


class Ticket(models.Model):
    CATEGORY_CHOICES = [('academic', 'Academic'), ('finance', 'Finance'), ('library', 'Library'), ('it', 'IT Support'), ('other', 'Other')]
    STATUS_CHOICES   = [('open', 'Open'), ('in_progress', 'In Progress'), ('resolved', 'Resolved')]

    student     = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='tickets')
    category    = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    subject     = models.CharField(max_length=200)
    description = models.TextField()
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"#{self.pk} – {self.subject} – {self.status}"


class TicketReply(models.Model):
    ticket     = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='replies')
    author     = models.ForeignKey(User, on_delete=models.CASCADE)
    message    = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Reply on #{self.ticket.pk} by {self.author.username}"


class ContactMessage(models.Model):
    DEPT_CHOICES = [('academic', 'Academic Office'), ('finance', 'Finance'), ('library', 'Library'), ('it', 'IT Support'), ('principal', "Principal's Office")]

    student    = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='contact_messages')
    department = models.CharField(max_length=20, choices=DEPT_CHOICES)
    subject    = models.CharField(max_length=200)
    message    = models.TextField()
    sent_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        return f"{self.student.enroll_id} → {self.department}: {self.subject}"

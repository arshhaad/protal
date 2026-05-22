from django.db import models
from django.contrib.auth.models import User


class StudentProfile(models.Model):
    """
    Extended profile for every student user.
    Linked 1-to-1 with Django's built-in User model.
    """

    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    user         = models.OneToOneField(
                       User, on_delete=models.CASCADE,
                       related_name='student_profile'
                   )
    enroll_id    = models.CharField(max_length=50, unique=True, db_index=True)
    phone        = models.CharField(max_length=15, blank=True)
    dob          = models.DateField(null=True, blank=True)
    gender       = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    address      = models.TextField(blank=True)
    class_name   = models.CharField(max_length=50, blank=True)
    section      = models.CharField(max_length=10, blank=True)
    roll_no      = models.CharField(max_length=10, blank=True)
    semester     = models.PositiveSmallIntegerField(default=1)
    guardian     = models.CharField(max_length=100, blank=True)
    guardian_phone = models.CharField(max_length=15, blank=True)
    profile_pic  = models.ImageField(
                       upload_to='profile_pics/', blank=True, null=True
                   )
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

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
        """Returns DOB as ISO string for HTML date input."""
        return self.dob.strftime('%Y-%m-%d') if self.dob else ''

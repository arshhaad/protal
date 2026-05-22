from django.apps import AppConfig


class StudDetailsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name  = 'students.stud_details'  # full dotted path from BASE_DIR
    label = 'stud_details'           # unique label (no dots)
    verbose_name = 'Student Details'

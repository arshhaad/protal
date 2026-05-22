from django.apps import AppConfig


class AuthStudConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name  = 'students.auth_stud'   # full dotted path from BASE_DIR
    label = 'auth_stud'            # unique label (no dots)
    verbose_name = 'Student Authentication'

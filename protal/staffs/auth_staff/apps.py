from django.apps import AppConfig


class AuthStaffConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name  = 'staffs.auth_staff'
    label = 'auth_staff'
    verbose_name = 'Staff Authentication'

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsStudent(BasePermission):
    """Allows access only to authenticated users who have a StudentProfile."""
    message = 'Student account required.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return hasattr(request.user, 'student_profile')


class IsStaffMember(BasePermission):
    """Allows access only to staff members (is_staff=True)."""
    message = 'Staff account required.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_staff or request.user.is_superuser


class IsAdminUser(BasePermission):
    """Allows access only to superusers / admins."""
    message = 'Admin account required.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_superuser


class IsStudentOrStaff(BasePermission):
    """Students (read) or Staff (read+write)."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        is_student = hasattr(request.user, 'student_profile')
        is_staff   = request.user.is_staff or request.user.is_superuser
        if request.method in SAFE_METHODS:
            return is_student or is_staff
        return is_staff


class IsOwnerStudent(BasePermission):
    """Object-level: student can only access their own data."""
    def has_object_permission(self, request, view, obj):
        if not hasattr(request.user, 'student_profile'):
            return False
        # obj may be a StudentProfile, or a related record with a .student FK
        if hasattr(obj, 'enroll_id'):  # StudentProfile itself
            return obj.user == request.user
        if hasattr(obj, 'student'):    # related model
            return obj.student.user == request.user
        return False

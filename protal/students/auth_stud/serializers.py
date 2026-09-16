from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str


class StudentLoginSerializer(serializers.Serializer):
    enroll_id = serializers.CharField()
    password  = serializers.CharField(write_only=True)

    def validate(self, data):
        enroll_id = data.get('enroll_id', '').strip()
        password  = data.get('password', '')

        if not enroll_id or not password:
            raise serializers.ValidationError('Both Enrollment ID and password are required.')

        # Find user by enroll_id via StudentProfile
        from students.stud_details.models import StudentProfile
        try:
            profile = StudentProfile.objects.select_related('user').get(enroll_id=enroll_id)
        except StudentProfile.DoesNotExist:
            raise serializers.ValidationError('Invalid Enrollment ID or password.')

        user = authenticate(username=profile.user.username, password=password)
        if user is None:
            raise serializers.ValidationError('Invalid Enrollment ID or password.')

        if not user.is_active:
            raise serializers.ValidationError('Your account is inactive. Please contact administration.')

        data['user'] = user
        return data


class StaffLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username', '').strip()
        password = data.get('password', '')

        if not username or not password:
            raise serializers.ValidationError('Both username and password are required.')

        # Support login by email too
        if '@' in username:
            try:
                user_obj = User.objects.get(email=username)
                username = user_obj.username
            except User.DoesNotExist:
                raise serializers.ValidationError('Invalid credentials.')

        user = authenticate(username=username, password=password)
        if user is None:
            raise serializers.ValidationError('Invalid credentials.')

        if not user.is_active:
            raise serializers.ValidationError('Your account is inactive.')

        if not (user.is_staff or user.is_superuser):
            raise serializers.ValidationError('Access restricted to staff members.')

        data['user'] = user
        return data


class AdminLoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email    = data.get('email', '').strip()
        password = data.get('password', '')

        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid credentials.')

        user = authenticate(username=user_obj.username, password=password)
        if user is None:
            raise serializers.ValidationError('Invalid credentials.')

        if not user.is_active:
            raise serializers.ValidationError('Your account is inactive.')

        if not (user.is_staff or user.is_superuser):
            raise serializers.ValidationError('Admin access only.')

        data['user'] = user
        return data


class ForgotPasswordSerializer(serializers.Serializer):
    """Used by all three portals — accepts enroll_id or email."""
    identifier = serializers.CharField(help_text='Enrollment ID or email address')


class ResetPasswordSerializer(serializers.Serializer):
    uidb64           = serializers.CharField()
    token            = serializers.CharField()
    new_password     = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})

        try:
            uid  = force_str(urlsafe_base64_decode(data['uidb64']))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({'uidb64': 'Invalid reset link.'})

        if not default_token_generator.check_token(user, data['token']):
            raise serializers.ValidationError({'token': 'Reset link is invalid or has expired.'})

        data['user'] = user
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password     = serializers.CharField(write_only=True)
    new_password     = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return data

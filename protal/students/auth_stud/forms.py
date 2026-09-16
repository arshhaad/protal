from django import forms
from django.contrib.auth.models import User


class CustomUser(forms.ModelForm):
    username = forms.CharField(
        label="username",
        widget=forms.TextInput(attrs={"placeholder": "username"}),
    )
    password1 = forms.CharField(
        label="Password",
        widget=forms.PasswordInput(attrs={"placeholder": "Password"}),
    )
    password2 = forms.CharField(
        label="Confirm Password",
        widget=forms.PasswordInput(attrs={"placeholder": "Confirm Password"}),
    )
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={"placeholder": "Email"}),
    )

    def clean(self):
        cleaned = super().clean()
        password = cleaned.get("password1")
        confirm_password = cleaned.get("password2")
        if password and confirm_password:
            if password != confirm_password:
                raise forms.ValidationError("Passwords don't match.")
            if len(password) < 6:
                raise forms.ValidationError("Password must be at least 6 characters.")
        return cleaned

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user

    class Meta:
        model = User
        fields = ["username", "email"]

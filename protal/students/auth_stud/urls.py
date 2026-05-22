from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('forget-password/', views.forget_password, name='forget_password'),
    path('reset-password/<uidb64>/<token>/', views.reset_pass, name='reset_pass'),
    path('dashboard/', views.dashboard, name='dashboard'),
]

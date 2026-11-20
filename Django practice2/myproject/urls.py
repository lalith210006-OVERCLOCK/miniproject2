
from django.contrib import admin
from django.urls import path
from django.shortcuts import render

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', render, {'template_name': 'index.html'}, name='home'),
]

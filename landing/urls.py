from django.urls import path

from landing import views

app_name = 'landing'

urlpatterns = [
    path('', views.landing, name='landing'),
]

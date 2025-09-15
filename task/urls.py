from django.urls import path

from task import views

app_name = 'task'

urlpatterns = [
    path('', views.index, name='index'),
    path("create-task/", views.create_task, name="create_task"),
]

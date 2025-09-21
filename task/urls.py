from django.urls import path

from task import views

app_name = 'task'

urlpatterns = [
    path('', views.index, name='index'),
    path("create-task/", views.create_task, name="create_task"),
    path("update-task/<int:task_id>/", views.update_task, name="update_task"),
    path("delete-task/<int:task_id>/", views.delete_task, name="delete_task"),
    path("projects/<int:project_id>/tasks/", views.project_tasks, name="project_tasks"),
]

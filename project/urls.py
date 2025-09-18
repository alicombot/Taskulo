from django.urls import path
from . import views

app_name = 'project'



urlpatterns = [
    path('add-project/', views.add_project, name='add_project'),
    path('update-project/', views.update_project, name='update_project'),
    path('delete-project/', views.delete_project, name='delete_project'),
]

from django.contrib import admin

from task.models import Task


# Register your models here.

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'due_date', 'priority', 'status','assigned_to')
    search_fields = ('title', 'description', 'due_date', 'priority')
    list_filter = ('title', 'description', 'due_date', 'priority', 'created_time', 'updated_time')

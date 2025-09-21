from django.db import models
from account.models import User
from project.models import Project


# Create your models here.

class Task(models.Model):
    PRIORITY_CHOICES = (
        ('normal', 'Normal'),
        ('low', 'Low'),
        ('high', 'High'),
    )
    STATUS_CHOICES = (
        ('todo', 'ToDo'),
        ('in progress', 'In Progress'),
        ('done', 'Done'),
    )

    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name="tasks")
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="user")
    title = models.CharField(max_length=100, verbose_name='عنوان')
    description = models.TextField(max_length=250, blank=True, null=True, verbose_name='توضیحات')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='normal')
    due_date = models.DateField(null=True, blank=True)
    created_time = models.DateTimeField(auto_now_add=True)
    updated_time = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_time']

    def __str__(self):
        return self.title

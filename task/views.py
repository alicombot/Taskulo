from django.shortcuts import render, redirect
from django.http import JsonResponse
from .forms import TaskForm
from .models import Task


# Create your views here.
def index(request):
    tasks = Task.objects.all()
    return render(request, 'task/tasks.html', {"tasks": tasks})


def create_task(request):
    if request.method == "POST":

        form = TaskForm(request.POST)
        if form.is_valid():
            task = form.save()

            if request.headers.get("x-requested-with") == "XMLHttpRequest":
                return JsonResponse({
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "priority": task.priority,
                    "due_date": task.due_date.isoformat() if task.due_date else "",
                })
            return redirect('task:index')
        else:
            if request.headers.get("x-requested-with") == "XMLHttpRequest":
                return JsonResponse({"errors": form.errors}, status=400)
            return render(request, 'task/tasks.html', {"form_errors": form.errors, "tasks": Task.objects.all()})

    return JsonResponse({"error": "Invalid request"}, status=400)

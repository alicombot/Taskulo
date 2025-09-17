from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from .forms import TaskForm
from .models import Task

# Create your views here.


@login_required
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

            context = {
                "form_errors": form.errors,
                "tasks": Task.objects.all(),
            }
            return render(request, 'task/tasks.html', context)

    return JsonResponse({"error": "Invalid request"}, status=400)


def update_task(request, task_id):
    if request.method == "POST":
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            if request.headers.get("x-requested-with") == "XMLHttpRequest":
                return JsonResponse({"error": "Task not found"}, status=404)
            return redirect('task:index')

        form = TaskForm(request.POST, instance=task)
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

            context = {
                "form_errors": form.errors,
                "tasks": Task.objects.all(),
            }
            return render(request, 'task/tasks.html', context)

    return JsonResponse({"error": "Invalid request"}, status=400)


@require_POST
def delete_task(request, task_id):
    try:
        task = get_object_or_404(Task, id=task_id)
        task.delete()
        return JsonResponse({
            "success": True,
            "message": "Task deleted successfully",
            "task_id": task_id
        })
    except Exception as e:
        return JsonResponse({
            "success": False,
            "message": f"Error deleting task: {str(e)}"
        }, status=400)

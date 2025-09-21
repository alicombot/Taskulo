from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from project.models import Project
from .forms import TaskForm
from .models import Task


# Create your views here.


@login_required
def index(request):
    tasks = Task.objects.filter(assigned_to=request.user)
    projects = Project.objects.filter(owner=request.user)

    todo_count = tasks.filter(status='todo').count()
    in_progress_count = tasks.filter(status='in progress').count()
    done_count = tasks.filter(status='done').count()

    context = {
        "tasks": tasks,
        "projects": projects,
        "project": None,
        "todo_count": todo_count,
        "in_progress_count": in_progress_count,
        "done_count": done_count,
    }
    return render(request, 'task/tasks.html', context)


@login_required
def create_task(request):
    if request.method == "POST":

        form = TaskForm(request.POST)
        if form.is_valid():
            task = form.save(commit=False)
            task.assigned_to = request.user
            project_id = request.POST.get("project")
            if project_id:
                try:
                    project = Project.objects.get(id=project_id, owner=request.user)
                    task.project = project
                except Project.DoesNotExist:
                    pass
            task.save()

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


@login_required
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
            task = form.save(commit=False)
            task.assigned_to = request.user
            task.save()
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


@login_required
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


@login_required
def project_tasks(request, project_id):
    project = None
    if int(project_id) != 0:
        project = get_object_or_404(Project, id=project_id, owner=request.user)
        tasks = Task.objects.filter(project=project, assigned_to=request.user)
    else:
        tasks = Task.objects.filter(assigned_to=request.user)

    todo_tasks = tasks.filter(status='todo')
    in_progress_tasks = tasks.filter(status='in progress')
    done_tasks = tasks.filter(status='done')

    context = {
        'project': project,
        'tasks': tasks,
        'todo_count': todo_tasks.count(),
        'in_progress_count': in_progress_tasks.count(),
        'done_count': done_tasks.count(),
    }

    return render(request, 'task/task.html', context)

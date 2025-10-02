from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json
from django.db.models import Q, Case, When, IntegerField
from datetime import date as dt_date
from project.models import Project
from .forms import TaskForm
from .models import Task


# Create your views here.


@login_required
def index(request):
    tasks = Task.objects.filter(assigned_to=request.user)
    sort_key = request.GET.get('sort', '')
    tasks = apply_sort(tasks, sort_key)
    projects = Project.objects.filter(owner=request.user)

    todo_count = tasks.filter(status='todo').count()
    in_progress_count = tasks.filter(status='in progress').count()
    done_count = tasks.filter(status='done').count()
    current_user = request.user

    context = {
        "tasks": tasks,
        "projects": projects,
        "project": None,
        "todo_count": todo_count,
        "in_progress_count": in_progress_count,
        "done_count": done_count,
        "current_user": current_user,
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

        # Allow partial AJAX updates for status only
        if request.headers.get("x-requested-with") == "XMLHttpRequest" and 'status' in request.POST:
            new_status = request.POST.get('status', '').strip()
            if new_status in ['todo', 'in progress', 'done']:
                task.status = new_status
                task.assigned_to = request.user
                task.save(update_fields=["status", "assigned_to", "updated_time"] if hasattr(task, 'updated_time') else ["status", "assigned_to"])  # best-effort
                return JsonResponse({
                    "id": task.id,
                    "status": task.status,
                })
            return JsonResponse({"error": "Invalid status"}, status=400)

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

    sort_key = request.GET.get('sort', '')
    tasks = apply_sort(tasks, sort_key)

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

def apply_sort(queryset, sort_key: str):
    """Apply supported sort ordering to a Task queryset.
    Supported keys: newest (default), oldest, due, priority, az
    """
    key = (sort_key or '').lower()
    if key == 'oldest':
        return queryset.order_by('created_time')
    if key == 'due':
        qs = queryset.annotate(
            due_null=Case(
                When(due_date__isnull=True, then=1),
                default=0,
                output_field=IntegerField(),
            )
        )
        return qs.order_by('due_null', 'due_date', 'created_time')
    if key == 'priority':
        qs = queryset.annotate(
            p_rank=Case(
                When(priority='high', then=0),
                When(priority='normal', then=1),
                When(priority='low', then=2),
                default=3,
                output_field=IntegerField(),
            )
        )
        return qs.order_by('p_rank', '-updated_time')
    if key == 'az':
        return queryset.order_by('title')
    return queryset.order_by('-created_time')


@login_required
def search_suggest(request):
    q = request.GET.get('q', '').strip()
    if not q:
        return JsonResponse({"results": []})

    tasks = Task.objects.filter(
        assigned_to=request.user
    ).filter(
        Q(title__icontains=q) | Q(description__icontains=q)
    ).order_by('-updated_time')[:8]

    results = [
        {
            "id": t.id,
            "title": t.title,
            "status": t.status,
        }
        for t in tasks
    ]
    return JsonResponse({"results": results})


@login_required
def search(request):
    q = request.GET.get('q', '').strip()
    date_str = request.GET.get('date', '').strip()
    project_id = request.GET.get('project')
    sort_key = request.GET.get('sort', '').strip()

    project = None
    tasks = Task.objects.filter(assigned_to=request.user)
    if project_id and project_id.isdigit() and int(project_id) != 0:
        try:
            project = Project.objects.get(id=project_id, owner=request.user)
            tasks = tasks.filter(project=project)
        except Project.DoesNotExist:
            project = None

    if q:
        # If q looks like an ISO date (YYYY-MM-DD), filter by due_date (DateField)
        try:
            q_date = dt_date.fromisoformat(q)
            tasks = tasks.filter(due_date=q_date)
        except ValueError:
            tasks = tasks.filter(Q(title__icontains=q) | Q(description__icontains=q))

    # Optional date filter (due_date exact match)
    if date_str:
        try:
            d = dt_date.fromisoformat(date_str)
            tasks = tasks.filter(due_date=d)
        except ValueError:
            pass

    # Apply sorting based on query param
    tasks = apply_sort(tasks, sort_key)

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


@login_required
@require_POST
def update_task_status(request, task_id):
    task = get_object_or_404(Task, id=task_id, assigned_to=request.user)
    data = json.loads(request.body)
    status = data.get('status')
    if status not in ['todo', 'in progress', 'done']:
        return JsonResponse({'success': False, 'error': 'Invalid status'})
    task.status = status
    task.save()
    return JsonResponse({'success': True})

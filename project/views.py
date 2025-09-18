from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, get_object_or_404
from django.template.defaultfilters import title

from project.models import Project


# Create your views here.


def add_project(request):
    if request.method == "POST":
        name = request.POST.get("name")
        print(name)
        if not name:
            return JsonResponse({"error": "No name"}, status=400)
        project = Project.objects.create(owner=request.user,title=name)
        projects = Project.objects.filter(owner=request.user)
        return JsonResponse({"id": project.id, "name": project.title, "total_project": projects.count()})
    return JsonResponse({"error": "Invalid request"}, status=400)


def update_project(request):
    project_id = request.POST.get("id")
    project_name = request.POST.get("name")

    project = get_object_or_404(Project, id=project_id)
    project.title = project_name
    project.save()

    return JsonResponse({'name': project.title})


def delete_project(request):
    project_id = request.POST.get("id")
    project = get_object_or_404(Project, id=project_id)
    project.delete()
    return JsonResponse({'success': True})

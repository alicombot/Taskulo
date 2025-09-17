from multiprocessing.dummy import JoinableQueue

from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.core.serializers import serialize
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_POST

from account.forms import LoginForm, SignUpForm
from account.models import User


# Create your views here.


def user_login(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            email = cd['email']
            password = cd['password']
            user = authenticate(request, email=email, password=password)
            if user is not None:
                login(request, user)
                return redirect('task:index')
            else:
                form.add_error(None, 'Email or password incorrect')

    else:
        form = LoginForm()



    context = {
        'form': form,
    }

    return render(request, 'registration/login.html', context)


def sign_up(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            user = User.objects.create(
                email=cd['email'],
                first_name=cd['name'],
                last_name=cd['last_name'],
            )
            user.set_password(cd['password'])
            user.save()
            return redirect('task:index')
    else:
        form = SignUpForm()



    context = {
        'form': form,
    }

    return render(request, 'registration/signup.html', context)



@require_POST
def account(request):
    user = User.objects.get(email=request.user)
    data = {
        'name': user.first_name,
        'lastname': user.last_name,
        'username': user.username,
        'email': user.email,
        'photo': user.photo.url if user.photo else None,
    }
    return JsonResponse(data)


def update_avatar(request):
    if request.FILES.get('photo'):
        user = request.user
        user.photo = request.FILES.get('photo')
        user.save()
        return JsonResponse({'photo': user.photo.url if user.photo else None})
    return JsonResponse({'error': 'No file uploaded'}, status=400)

def update_user(request):
    user = request.user
    name = request.POST.get('name')
    user.last_name = request.POST.get('lastname')
    username = request.POST.get('username')
    email = request.POST.get('gmail')

    if name:
        user.first_name = name
    else:
        return JsonResponse({'field': 'name', 'message': 'required field.'}, status=400)


    if email and email != user.email:
        if User.objects.filter(email=email).exclude(pk=user.pk).exists():
            return JsonResponse({'field': 'email', 'message': 'Email already exists'}, status=400)
        user.email = email

    if username and username != user.username:
        if User.objects.filter(username=username).exclude(id=user.id).exists():
            return JsonResponse({'field': 'username', 'message': 'Username already exists'}, status=400)
        user.username = username


    user.save()
    return JsonResponse({'status': 'success', 'message': 'Changes saved successfully'})


def log_out(request):
    logout(request)
    return redirect('landing:landing')
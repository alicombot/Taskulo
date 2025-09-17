from django.urls import path, reverse_lazy
from django.contrib.auth import views as auth_views
from account import views

app_name = 'account'


urlpatterns = [
    path('', views.account, name='account'),
    path('update-user/',views.update_user, name='update_user'),
    path('update-avatar/', views.update_avatar, name='update_avatar'),
    path('login/', views.user_login, name='user_login'),
    path('logout', views.log_out, name='log_out'),
    path('password-change/', auth_views.PasswordChangeView.as_view(success_url='done'), name='password_change'),
    path('password-change/done/', auth_views.PasswordChangeDoneView.as_view(), name='password_change_done'),
    path('password-reset/', auth_views.PasswordResetView.as_view(success_url='done',
                                                                 html_email_template_name='registration/password_reset_email.html',
                                                                 email_template_name='registration/password_reset_email.txt'), name='password_reset'),
    path('password-reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('password-reset/<uidb64>/<token>/',
         auth_views.PasswordResetConfirmView.as_view(success_url=reverse_lazy('account:password_reset_complete')),
         name='password_reset_confirm'),
    path('password-reset/complete/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
    path('sign-up/', views.sign_up, name='sign_up'),

]
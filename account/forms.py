from django import forms

from account.models import User


class LoginForm(forms.Form):
    email = forms.CharField(widget=forms.EmailInput(attrs={'class': 'panel-account__input'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'panel-account__input'}))


class SignUpForm(forms.Form):
    name = forms.CharField(widget=forms.TextInput(attrs={'class': 'panel-account__input'}))
    last_name = forms.CharField(widget=forms.TextInput(attrs={'class': 'panel-account__input'}), required=False)
    email = forms.CharField(widget=forms.EmailInput(attrs={'class': 'panel-account__input'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'panel-account__input'}))
    password2 = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'panel-account__input'}))


    def clean(self):
        cd = self.cleaned_data
        password = self.cleaned_data.get('password', None)
        password2 = self.cleaned_data.get('password2', None)
        if password != password2:
            raise forms.ValidationError('Passwords don\'t match')
        elif password is None or password2 is None:
            raise forms.ValidationError('This field is empty. Please fill it in.')



    def clean_email(self):
        email = self.cleaned_data['email']
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError('Email already registered')
        return email
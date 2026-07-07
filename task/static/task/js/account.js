/** Account panel — avatar upload & profile editing. */
import { getCsrfToken } from './utils.js';

export function initAccount() {
  const accountForm = document.getElementById('account-form');
  const accountEditBtn = document.getElementById('account-edit-btn');
  const accountSaveBtn = document.getElementById('account-save-btn');
  const avatarEditBtn = document.getElementById('avatar-edit-btn');
  const avatarFile = document.getElementById('avatar-file');

  avatarEditBtn?.addEventListener('click', () => avatarFile?.click());

  avatarFile?.addEventListener('change', function () {
    const file = this.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('account-avatar')?.setAttribute('src', e.target.result);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('csrfmiddlewaretoken', getCsrfToken());

    fetch(accountForm.dataset.avatarUrl, {
      method: 'POST',
      body: formData,
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.photo) {
          document.getElementById('account-avatar')?.setAttribute('src', data.photo);
          document.querySelectorAll('.profile__image, #account-avatar').forEach((img) => {
            img.setAttribute('src', data.photo);
            img.classList.remove('profile__image--placeholder', 'panel-account__img--placeholder');
          });
        }
      })
      .catch((err) => console.error('Avatar error:', err));
  });

  accountEditBtn?.addEventListener('click', () => {
    const isEdit = accountForm.classList.toggle('edit-mode');
    const fields = ['name', 'lastname', 'username', 'gmail'];
    if (isEdit) {
      fields.forEach((field) => {
        const span = accountForm.querySelector(`.account-value[data-field="${field}"]`);
        const input = accountForm.querySelector(`#${field}`);
        if (span && input) input.value = span.textContent.trim();
      });
      accountEditBtn.textContent = 'Cancel';
      if (accountSaveBtn) accountSaveBtn.hidden = false;
    } else {
      accountEditBtn.textContent = 'Edit';
      if (accountSaveBtn) accountSaveBtn.hidden = true;
    }
  });

  accountSaveBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const formData = new URLSearchParams({ csrfmiddlewaretoken: getCsrfToken() });
    accountForm.querySelectorAll('.account-input').forEach((input) => {
      formData.append(input.name, input.value);
    });

    fetch(accountForm.dataset.updateUrl, { method: 'POST', body: formData })
      .then((r) => {
        if (!r.ok) return r.json().then((data) => Promise.reject(data));
        return r.json();
      })
      .then(() => {
        const success = document.getElementById('form-success');
        if (success) {
          success.textContent = 'Saved successfully ✅';
          success.hidden = false;
          setTimeout(() => {
            success.hidden = true;
          }, 3000);
        }

        return fetch(accountForm.dataset.refreshUrl, {
          method: 'POST',
          body: new URLSearchParams({ csrfmiddlewaretoken: getCsrfToken() }),
        }).then((r) => r.json());
      })
      .then((data) => {
        document.querySelector(".account-value[data-field='name']").textContent = data.name;
        document.querySelector(".account-value[data-field='lastname']").textContent = data.lastname || '';
        document.querySelector(".account-value[data-field='username']").textContent = data.username || '';
        document.querySelector(".account-value[data-field='gmail']").textContent = data.email;
        document.querySelector('.nav__title').textContent = `Welcome back, ${data.name} 👋`;

        const heroName = document.getElementById('account-hero-name');
        const heroEmail = document.getElementById('account-hero-email');
        if (heroName) heroName.textContent = `${data.name || ''} ${data.lastname || ''}`.trim();
        if (heroEmail) heroEmail.textContent = data.email || '';

        if (data.photo) {
          document.getElementById('account-avatar')?.setAttribute('src', data.photo);
        }
        accountForm.classList.remove('edit-mode');
        accountEditBtn.textContent = 'Edit';
        if (accountSaveBtn) accountSaveBtn.hidden = true;
      })
      .catch((res) => {
        if (res?.field === 'email') showFieldError('gmail-message', res.message);
        if (res?.field === 'username') showFieldError('username-message', res.message);
        if (res?.field === 'name') showFieldError('name-message', res.message);
      });
  });

  accountForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (accountForm.classList.contains('edit-mode')) {
      accountSaveBtn?.click();
    }
  });

  document.getElementById('username')?.addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z0-9_]/g, '');
  });

  document.getElementById('gmail')?.addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z0-9@._-]/g, '');
  });
}

function showFieldError(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = `❌ ${message}`;
  el.classList.add('error');
  setTimeout(() => {
    el.textContent = '';
  }, 3000);
}

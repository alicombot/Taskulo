/** Project CRUD (add, rename, delete). */
import { getCsrfToken, reloadTaskBoard, syncMobileProjectContext } from './utils.js';
import { NotificationManager } from './notifications.js';

const EDIT_SVG =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>';
const DELETE_SVG =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M14 6V4a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v2"/></svg>';

let editingProjectItem = null;

function updateAllProjectsCount(total) {
  const meta = document.querySelector('[data-project-count]');
  if (!meta) return;
  const n = total ?? 0;
  meta.textContent = `${n} project${n === 1 ? '' : 's'}`;
}

function getProjectNameEl(item) {
  return item?.querySelector('.project-item__name');
}

function createProjectItemElement({ id, name, url }) {
  const li = document.createElement('li');
  li.className = 'project-item project-link';
  li.dataset.id = String(id);
  li.dataset.url = url;
  li.innerHTML = `
    <div class="project-item__main">
      <span class="project-item__dot" aria-hidden="true"></span>
      <span class="project-item__name"></span>
    </div>
    <div class="project-item__actions">
      <button type="button" class="project-item__btn project-item__btn--edit" aria-label="Rename project">${EDIT_SVG}</button>
      <button type="button" class="project-item__btn project-item__btn--delete" aria-label="Delete project">${DELETE_SVG}</button>
    </div>`;
  li.querySelector('.project-item__name').textContent = name;
  return li;
}

function setCreateFormOpen(open) {
  const form = document.getElementById('project-create-form');
  const addBtn = document.querySelector('.panel-add-project-btn');
  if (!form) return;
  if (open) setEditFormOpen(false);
  form.hidden = !open;
  addBtn?.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open) {
    document.getElementById('project-create-input')?.focus();
  } else {
    const input = document.getElementById('project-create-input');
    if (input) input.value = '';
  }
}

function setEditFormOpen(open, projectItem = null) {
  const form = document.getElementById('project-edit-form');
  const input = document.getElementById('project-edit-input');
  if (!form || !input) return;

  if (open) {
    setCreateFormOpen(false);
    editingProjectItem?.classList.remove('is-editing');
    editingProjectItem = projectItem;
    editingProjectItem?.classList.add('is-editing');

    const nameEl = getProjectNameEl(projectItem);
    input.value = nameEl?.textContent.trim() || '';
    form.hidden = false;
    input.focus();
    input.select();
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  form.hidden = true;
  input.value = '';
  editingProjectItem?.classList.remove('is-editing');
  editingProjectItem = null;
}

function submitCreateProject() {
  const input = document.getElementById('project-create-input');
  const submitBtn = document.getElementById('project-create-submit');
  const list = document.getElementById('project-list');
  if (!input || !list) return;

  const value = input.value.trim();
  if (!value) return;

  submitBtn.disabled = true;
  const body = new URLSearchParams({
    name: value,
    csrfmiddlewaretoken: getCsrfToken(),
  });

  fetch('/project/add-project/', { method: 'POST', body })
    .then((r) => r.json())
    .then((data) => {
      const item = createProjectItemElement({
        id: data.id,
        name: data.name || value,
        url: `/dashboard/projects/${data.id}/tasks/`,
      });
      list.appendChild(item);
      updateAllProjectsCount(data.total_project);
      setCreateFormOpen(false);
      NotificationManager.notify({
        title: 'Project added',
        description: data.name || value,
        type: 'success',
      });
    })
    .catch((err) => {
      console.error('Add project error:', err);
      NotificationManager.notify({
        title: 'Could not create project',
        description: 'Please try again.',
        type: 'error',
      });
    })
    .finally(() => {
      submitBtn.disabled = false;
    });
}

function submitEditProject() {
  const input = document.getElementById('project-edit-input');
  const submitBtn = document.getElementById('project-edit-submit');
  if (!input || !editingProjectItem) return;

  const nameEl = getProjectNameEl(editingProjectItem);
  const current = nameEl?.textContent.trim() || '';
  const newName = input.value.trim();
  if (!newName) return;

  submitBtn.disabled = true;
  const body = new URLSearchParams({
    id: editingProjectItem.dataset.id,
    name: newName,
    csrfmiddlewaretoken: getCsrfToken(),
  });

  fetch('/project/update-project/', { method: 'POST', body })
    .then((r) => r.json())
    .then((data) => {
      if (nameEl) nameEl.textContent = data.name || newName;
      setEditFormOpen(false);
      syncMobileProjectContext();
      NotificationManager.notify({
        title: 'Project renamed',
        description: data.name || newName,
        type: 'success',
      });
    })
    .catch((err) => {
      console.error('Rename error:', err);
      if (nameEl) nameEl.textContent = current;
      NotificationManager.notify({
        title: 'Could not rename project',
        description: 'Please try again.',
        type: 'error',
      });
    })
    .finally(() => {
      submitBtn.disabled = false;
    });
}

function deleteProject(projectItem) {
  if (editingProjectItem === projectItem) setEditFormOpen(false);

  const nameEl = getProjectNameEl(projectItem);
  const pTitle = nameEl?.textContent.trim() || 'Project';

  const body = new URLSearchParams({
    id: projectItem.dataset.id,
    csrfmiddlewaretoken: getCsrfToken(),
  });

  fetch('/project/delete-project/', { method: 'POST', body })
    .then((r) => r.json())
    .then((data) => {
      const wasActive = projectItem.classList.contains('is-active');
      projectItem.remove();
      updateAllProjectsCount(data.total_project);

      if (wasActive) {
        const allLink = document.querySelector('.project-item.project-link[data-id="0"]');
        allLink?.classList.add('is-active');
        syncMobileProjectContext();
        const url = allLink?.dataset.url;
        if (url) {
          reloadTaskBoard(url).catch((err) =>
            console.error('Error loading all projects:', err)
          );
        }
      }

      NotificationManager.notify({
        title: 'Project deleted',
        description: pTitle,
        type: 'error',
      });
    })
    .catch((err) => console.error('Delete error:', err));
}

export function closeProjectForms() {
  setCreateFormOpen(false);
  setEditFormOpen(false);
}

export function attachProjectActions() {
  /* Actions are rendered in the template or via createProjectItemElement. */
}

export function initProjects() {
  const list = document.getElementById('project-list');
  if (!list) return;

  list.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.project-item__btn--edit');
    const deleteBtn = e.target.closest('.project-item__btn--delete');
    const projectItem = e.target.closest('.project-item.project-link');
    if (!projectItem || projectItem.dataset.id === '0') return;

    if (editBtn) {
      e.stopPropagation();
      const form = document.getElementById('project-edit-form');
      const isSameItem = editingProjectItem === projectItem;
      const isOpen = form && !form.hidden;
      setEditFormOpen(!(isOpen && isSameItem), projectItem);
    } else if (deleteBtn) {
      e.stopPropagation();
      deleteProject(projectItem);
    }
  });

  document.querySelector('.panel-add-project-btn')?.addEventListener('click', () => {
    const form = document.getElementById('project-create-form');
    setCreateFormOpen(form?.hidden !== false);
  });

  document
    .querySelector('[data-action="cancel-project-create"]')
    ?.addEventListener('click', () => setCreateFormOpen(false));

  document
    .querySelector('[data-action="cancel-project-edit"]')
    ?.addEventListener('click', () => setEditFormOpen(false));

  document
    .getElementById('project-create-submit')
    ?.addEventListener('click', submitCreateProject);

  document
    .getElementById('project-edit-submit')
    ?.addEventListener('click', submitEditProject);

  document.getElementById('project-create-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitCreateProject();
    } else if (e.key === 'Escape') {
      setCreateFormOpen(false);
    }
  });

  document.getElementById('project-edit-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitEditProject();
    } else if (e.key === 'Escape') {
      setEditFormOpen(false);
    }
  });
}

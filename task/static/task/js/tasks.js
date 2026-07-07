/** Task board interactions — CRUD, status, inline edit. */
import {
  getActiveProjectLink,
  getCsrfToken,
  reloadTaskBoard,
  withSort,
} from './utils.js';
import { initKanbanTabs, initKanbanTabListeners, switchKanbanTab } from './kanban-tabs.js';
import { initDragDrop, syncDraggableCards } from './drag-drop.js';
import { NotificationManager } from './notifications.js';
import { showConfirmDialog } from './confirm-dialog.js';
import { getTaskDateFieldHtml, initTaskDatePickers } from './task-date-picker.js';

let isCreatingTaskSubmitting = false;
let suppressUpdateToastUntil = 0;

const taskMenuOrigins = new WeakMap();
let openTaskMenuId = null;
let activeMenuPair = null;

function getTaskMenuTrigger(taskId) {
  return document.querySelector(`[data-task-menu="${taskId}"]`);
}

function getTaskCardById(taskId) {
  return document.querySelector(`.task-card[data-id="${taskId}"], .task[data-id="${taskId}"]`);
}

function positionTaskMenu(menu, trigger) {
  if (!menu || !trigger) return;

  menu.style.position = 'fixed';
  menu.style.margin = '0';
  menu.style.display = 'block';
  menu.style.visibility = 'hidden';
  menu.style.left = '0';
  menu.style.top = '0';
  menu.style.bottom = 'auto';
  menu.style.right = 'auto';

  const triggerRect = trigger.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const gap = 6;
  const pad = 8;
  const menuWidth = menuRect.width || 130;
  const menuHeight = menuRect.height || 72;
  const isRtl = getComputedStyle(document.documentElement).direction === 'rtl';

  let left = isRtl
    ? triggerRect.left
    : triggerRect.right - menuWidth;
  let top = triggerRect.bottom + gap;

  if (top + menuHeight > window.innerHeight - pad) {
    top = triggerRect.top - menuHeight - gap;
  }

  left = Math.max(pad, Math.min(left, window.innerWidth - menuWidth - pad));
  top = Math.max(pad, Math.min(top, window.innerHeight - menuHeight - pad));

  menu.style.left = `${Math.round(left)}px`;
  menu.style.top = `${Math.round(top)}px`;
  menu.style.zIndex = '9999';
  menu.style.visibility = 'visible';
}

function resetTaskMenuPosition(menu) {
  if (!menu) return;
  menu.style.position = '';
  menu.style.top = '';
  menu.style.bottom = '';
  menu.style.left = '';
  menu.style.right = '';
  menu.style.zIndex = '';
  menu.style.margin = '';
  menu.style.visibility = '';
  menu.style.display = '';
}

export function closeAllTaskMenus() {
  document.querySelectorAll('.task-options.is-open').forEach((menu) => {
    const taskId = menu.dataset.taskId || menu.id.replace('task-options-', '');
    const trigger = getTaskMenuTrigger(taskId);
    const card = getTaskCardById(taskId);
    menu.classList.remove('is-open');
    trigger?.classList.remove('open');
    trigger?.setAttribute('aria-expanded', 'false');
    card?.classList.remove('task-card--menu-open');
    resetTaskMenuPosition(menu);
    const origin = taskMenuOrigins.get(menu);
    if (origin?.parent?.isConnected) {
      if (origin.next && origin.next.parentElement === origin.parent) {
        origin.parent.insertBefore(menu, origin.next);
      } else {
        origin.parent.appendChild(menu);
      }
    }
  });
  openTaskMenuId = null;
  activeMenuPair = null;
}

function openTaskMenu(taskId) {
  const menu = document.getElementById(`task-options-${taskId}`);
  const trigger = getTaskMenuTrigger(taskId);
  const card = getTaskCardById(taskId);
  if (!menu || !trigger) return;

  if (!taskMenuOrigins.has(menu)) {
    taskMenuOrigins.set(menu, { parent: menu.parentElement, next: menu.nextSibling });
  }

  document.body.appendChild(menu);
  menu.classList.add('is-open');
  trigger.classList.add('open');
  trigger.setAttribute('aria-expanded', 'true');
  card?.classList.add('task-card--menu-open');
  openTaskMenuId = taskId;
  activeMenuPair = { menu, trigger };

  positionTaskMenu(menu, trigger);
}

export function toggleActions(taskId) {
  const id = String(taskId);
  if (openTaskMenuId === id) {
    closeAllTaskMenus();
    return;
  }
  closeAllTaskMenus();
  openTaskMenu(id);
}

async function moveTaskToStatus(card, newStatus, { animate = false } = {}) {
  const editUrl = card.getAttribute('data-edit-url');
  if (!editUrl || !newStatus || card.getAttribute('data-status') === newStatus) return false;

  const formData = new FormData();
  formData.append('status', newStatus);
  const csrf = getCsrfToken();
  if (csrf) formData.append('csrfmiddlewaretoken', csrf);

  const send = async () => {
    const response = await fetch(editUrl, {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body: formData,
    });
    if (!response.ok) throw new Error('Status update failed');
    const data = await response.json();
    return data?.status === newStatus;
  };

  if (!animate) return send();

  return new Promise((resolve) => {
    let done = false;
    const run = async () => {
      if (done) return;
      done = true;
      try {
        resolve(await send());
      } catch {
        resolve(false);
      }
    };
    const checkBtn = card.querySelector('.task__title--check');
    checkBtn?.classList.add('task-card__check--checked');
    card.classList.add('task--moving');
    card.addEventListener('animationend', run, { once: true });
    setTimeout(run, 320);
  });
}

function enterTaskEditMode(taskCard) {
  if (!taskCard || taskCard.classList.contains('task--form')) return;

  const taskId = taskCard.getAttribute('data-id') || '';
  const editUrl = taskCard.getAttribute('data-edit-url') || `/dashboard/update-task/${taskId}/`;
  const currentTitle = taskCard.getAttribute('data-title') || '';
  const currentDesc = taskCard.getAttribute('data-description') || '';
  const currentDue = taskCard.getAttribute('data-due-date') || '';
  const currentPriority = taskCard.getAttribute('data-priority') || 'normal';
  const csrf = getCsrfToken();
  const originalHTML = taskCard.innerHTML;

  taskCard.classList.add('task--form');
  taskCard.innerHTML = `
    <form method="post" action="${editUrl}" class="task-form" novalidate>
      <input type="hidden" name="csrfmiddlewaretoken" value="${csrf}">
      <div class="task-form__header"><h4>Edit task</h4></div>
      <div class="task-form__row">
        <input class="task-form__input" name="title" type="text" placeholder="Task title" required value="${currentTitle.replace(/"/g, '&quot;')}">
      </div>
      <div class="task-form__row">
        <textarea class="task-form__textarea" name="description" rows="2" placeholder="Short description">${currentDesc.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
      </div>
      <div class="task-form__meta">
        <div class="task-form__field task-form__field--date">
          <span class="task-form__field-label">Due date</span>
          ${getTaskDateFieldHtml({ value: currentDue })}
        </div>
        <div class="task-form__field task-form__field--priority">
          <span class="task-form__field-label">Priority</span>
          <div class="task-form__priority" role="radiogroup" aria-label="Task priority">
            <label class="task-form__priority-btn task-form__priority-btn--low">
              <input type="radio" name="priority" value="low" ${currentPriority === 'low' ? 'checked' : ''}>
              <span>Low</span>
            </label>
            <label class="task-form__priority-btn task-form__priority-btn--normal">
              <input type="radio" name="priority" value="normal" ${currentPriority === 'normal' ? 'checked' : ''}>
              <span>Normal</span>
            </label>
            <label class="task-form__priority-btn task-form__priority-btn--high">
              <input type="radio" name="priority" value="high" ${currentPriority === 'high' ? 'checked' : ''}>
              <span>High</span>
            </label>
          </div>
        </div>
      </div>
      <div class="task-form__actions">
        <button type="button" class="btn btn--ghost" data-action="cancel-inline-edit">Cancel</button>
        <button type="submit" class="btn btn--primary">Save</button>
      </div>
    </form>`;

  taskCard.querySelector('[data-action="cancel-inline-edit"]')?.addEventListener(
    'click',
    () => {
      taskCard.innerHTML = originalHTML;
      taskCard.classList.remove('task--form');
    },
    { once: true }
  );

  initTaskDatePickers(taskCard);
}

async function refreshBoard() {
  const link = getActiveProjectLink();
  if (link?.dataset.url) await reloadTaskBoard(link.dataset.url);
}

async function applyStatusAfterCreate(taskId, targetStatus) {
  if (!taskId || !targetStatus || targetStatus === 'todo') return;

  const statusData = new FormData();
  statusData.append('status', targetStatus);
  const csrf = getCsrfToken();
  if (csrf) statusData.append('csrfmiddlewaretoken', csrf);

  const response = await fetch(`/dashboard/update-task/${taskId}/`, {
    method: 'POST',
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
    body: statusData,
  });

  if (!response.ok) throw new Error('Failed to set task status');
}

function syncColumnEmptyState(column) {
  const cards = column?.querySelector('.kanban-column__cards');
  if (!cards) return;
  const empty = cards.querySelector('.task--empty');
  if (!empty) return;
  const hasTaskCard = cards.querySelector('.task-card, .task--adv');
  if (hasTaskCard) empty.setAttribute('hidden', '');
  else empty.removeAttribute('hidden');
}

function hideAllCreateForms() {
  document.querySelectorAll('.server-task-form-wrap').forEach((wrap) => {
    wrap.hidden = true;
    syncColumnEmptyState(wrap.closest('.kanban-column'));
  });
}

function openCreateFormForColumn(column) {
  const status = column?.dataset.status || 'todo';
  switchKanbanTab(status);
  hideAllCreateForms();

  const cards = column?.querySelector('.kanban-column__cards');
  const formWrap = column?.querySelector('.server-task-form-wrap')
    || document.getElementById('server-task-form-todo');
  if (!formWrap) return;

  if (cards) {
    cards.prepend(formWrap);
    cards.querySelector('.task--empty')?.setAttribute('hidden', '');
  }

  formWrap.hidden = false;
  window.requestAnimationFrame(() => {
    formWrap.querySelector('input[name="title"]')?.focus();
    formWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

export function initTasks() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-task-menu]');
    if (!trigger) return;
    if (e.target.closest('.task-options')) return;
    e.stopPropagation();
    toggleActions(trigger.dataset.taskMenu);
  });

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.task__title--check, .task-card__title');
    if (!trigger) return;
    const card = trigger.closest('.task');
    if (!card) return;
    const checkBtn = card.querySelector('.task__title--check');
    const nextStatus =
      trigger.getAttribute('data-next-status') ||
      checkBtn?.getAttribute('data-next-status');
    if (!nextStatus) return;

    moveTaskToStatus(card, nextStatus, { animate: true })
      .then((ok) => {
        if (ok) {
          NotificationManager.notify({
            title: 'Task status updated',
            description: `${card.getAttribute('data-title') || ''} → ${nextStatus}`,
            type: 'update',
          });
          refreshBoard();
        }
      })
      .catch((err) => {
        console.error('Status update error', err);
        card.classList.remove('task--moving');
        NotificationManager.notify({
          title: 'Server error',
          description: 'Could not update status',
          type: 'error',
        });
      });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-task-menu], .task-options')) {
      closeAllTaskMenus();
    }
  });

  document.addEventListener('click', async (e) => {
    const optionEl = e.target.closest('.task-option');
    if (!optionEl) return;
    const menu = optionEl.closest('.task-options');
    if (!menu) return;

    const taskId = menu.dataset.taskId || menu.id.replace('task-options-', '');
    const taskCard = getTaskCardById(taskId);
    if (!taskCard) return;
    const action = optionEl.dataset.action;

    if (action === 'delete') {
      if (!taskId) return;
      closeAllTaskMenus();

      const taskTitle = taskCard.getAttribute('data-title') || 'this task';
      const confirmed = await showConfirmDialog({
        title: 'Delete task?',
        message: `"${taskTitle}" will be permanently removed.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger',
      });
      if (!confirmed) return;

      try {
        const response = await fetch(
          taskCard.getAttribute('data-delete-url') || `/dashboard/delete-task/${taskId}/`,
          {
            method: 'POST',
            headers: {
              'X-CSRFToken': getCsrfToken(),
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          taskCard.remove();
          NotificationManager.notify({
            title: 'Task deleted',
            description: taskTitle,
            type: 'error',
          });
          refreshBoard();
        } else {
          NotificationManager.notify({
            title: 'Delete failed',
            description: data.message || 'Could not delete this task.',
            type: 'error',
          });
        }
      } catch (err) {
        console.error('Error deleting task:', err);
        NotificationManager.notify({
          title: 'Delete failed',
          description: 'Could not connect to the server.',
          type: 'error',
        });
      }
    } else if (action === 'move') {
      const newStatus = optionEl.dataset.status;
      closeAllTaskMenus();
      try {
        const ok = await moveTaskToStatus(taskCard, newStatus);
        if (ok) {
          switchKanbanTab(newStatus);
          NotificationManager.notify({
            title: 'Task moved',
            description: `${taskCard.getAttribute('data-title') || ''} → ${newStatus}`,
            type: 'update',
          });
          await refreshBoard();
        }
      } catch (err) {
        console.error('Move task error', err);
        NotificationManager.notify({
          title: 'Move failed',
          description: 'Could not update task status',
          type: 'error',
        });
      }
      return;
    } else if (action === 'edit') {
      enterTaskEditMode(taskCard);
    }

    closeAllTaskMenus();
  });

  document.addEventListener('click', (e) => {
    const addTaskBtn = e.target.closest('.add-task');
    if (!addTaskBtn) return;

    const column = addTaskBtn.closest('.kanban-column');
    if (column) {
      openCreateFormForColumn(column);
      return;
    }

    const todoColumn = document.querySelector('.kanban-column[data-status="todo"]');
    openCreateFormForColumn(todoColumn);
  });

  document.addEventListener('click', (e) => {
    const cancelBtn = e.target.closest('[data-action="cancel"]');
    if (!cancelBtn) return;
    const formWrap = cancelBtn.closest('.server-task-form-wrap');
    if (formWrap) {
      formWrap.hidden = true;
      syncColumnEmptyState(formWrap.closest('.kanban-column'));
    }
  });

  document.addEventListener('submit', (e) => {
    const form = e.target.closest('.server-task-form-wrap form.task-form');
    if (!form) return;
    e.preventDefault();
    if (isCreatingTaskSubmitting) return;
    isCreatingTaskSubmitting = true;

    const formWrap = form.closest('.server-task-form-wrap');
    const column = formWrap?.closest('.kanban-column');
    const targetStatus = column?.dataset.status || 'todo';

    fetch(form.action, {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body: new FormData(form),
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (data.errors) {
          NotificationManager.notify({
            title: 'Validation warning',
            description: 'Please check the fields',
            type: 'warning',
          });
          alert('Validation error');
          return;
        }
        await applyStatusAfterCreate(data.id, targetStatus);
        form.reset();
        if (formWrap) formWrap.hidden = true;
        suppressUpdateToastUntil = Date.now() + 2000;
        if (targetStatus !== 'todo') {
          switchKanbanTab(targetStatus);
        }
        await refreshBoard();
        NotificationManager.notify({
          title: 'Task created',
          description: data?.title || '',
          type: 'success',
        });
      })
      .catch((err) => {
        console.error('Create task error', err);
        NotificationManager.notify({
          title: 'Server error',
          description: 'Could not create task',
          type: 'error',
        });
      })
      .finally(() => {
        isCreatingTaskSubmitting = false;
      });
  });

  document.addEventListener('submit', (e) => {
    const editForm = e.target.closest('.task.task--form form.task-form');
    if (!editForm || !/update-task\//.test(editForm.action)) return;
    e.preventDefault();

    fetch(editForm.action, {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body: new FormData(editForm),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.errors) {
          NotificationManager.notify({
            title: 'Validation warning',
            description: 'Please check the fields',
            type: 'warning',
          });
          alert('Validation error');
          return;
        }
        refreshBoard().then(() => {
          if (Date.now() >= suppressUpdateToastUntil) {
            NotificationManager.notify({
              title: 'Task updated',
              description: data.title || '',
              type: 'update',
            });
          }
        });
      })
      .catch((err) => {
        console.error('Update task error', err);
        NotificationManager.notify({
          title: 'Server error',
          description: 'Could not update task',
          type: 'error',
        });
      });
  });

  initKanbanTabListeners();
  initKanbanTabs();
  initDragDrop();
  initTaskDatePickers();

  document.addEventListener(
    'scroll',
    () => {
      if (activeMenuPair) {
        positionTaskMenu(activeMenuPair.menu, activeMenuPair.trigger);
      }
    },
    true
  );

  window.addEventListener('resize', () => {
    if (activeMenuPair) {
      positionTaskMenu(activeMenuPair.menu, activeMenuPair.trigger);
    }
  });
}

/** Shared utilities for the Taskulo dashboard. */

import { initKanbanTabs } from './kanban-tabs.js';

export function getCookie(name) {
  if (!document.cookie) return null;
  const cookies = document.cookie.split(';');
  for (const raw of cookies) {
    const cookie = raw.trim();
    if (cookie.startsWith(`${name}=`)) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

export function getCsrfToken() {
  return (
    document.querySelector('[name=csrfmiddlewaretoken]')?.value ||
    getCookie('csrftoken') ||
    ''
  );
}

export function getSelectedSortKey() {
  const txt = (document.querySelector('.sort__text')?.textContent || '')
    .trim()
    .toLowerCase();
  if (txt === 'oldest') return 'oldest';
  if (txt === 'due soon') return 'due';
  if (txt === 'high priority') return 'priority';
  if (txt === 'a-z') return 'az';
  return 'newest';
}

export function withSort(url) {
  const key = getSelectedSortKey();
  try {
    const u = new URL(url, window.location.origin);
    if (key && key !== 'newest') u.searchParams.set('sort', key);
    else u.searchParams.delete('sort');
    return u.pathname + (u.search || '');
  } catch {
    if (key && key !== 'newest') {
      return `${url}${url.includes('?') ? '&' : '?'}sort=${encodeURIComponent(key)}`;
    }
    return url;
  }
}

export function getActiveProjectLink() {
  return (
    document.querySelector('.project-link.is-active') ||
    document.querySelector('.project-item.project-link[data-id="0"]')
  );
}

export function getActiveProjectId() {
  const link = getActiveProjectLink();
  return link?.getAttribute('data-id') || '0';
}

export function debounce(fn, delay) {
  let timerId = null;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function showElement(el) {
  if (!el) return;
  el.hidden = false;
  el.removeAttribute('hidden');
}

export function hideElement(el) {
  if (!el) return;
  el.hidden = true;
}

export function toggleDisplay(el, forceOpen) {
  if (!el) return false;
  const isOpen = !el.hidden;
  const open = forceOpen !== undefined ? forceOpen : !isOpen;
  el.hidden = !open;
  return open;
}

export function syncDashboardStats() {
  const counts = { todo: 0, progress: 0, done: 0 };
  document.querySelectorAll('.kanban-column').forEach((col) => {
    const status = col.dataset.status;
    const cards = col.querySelectorAll('.task-card, .task--adv').length;
    if (status === 'todo') counts.todo = cards;
    else if (status === 'in progress') counts.progress = cards;
    else if (status === 'done') counts.done = cards;
  });
  const total = counts.todo + counts.progress + counts.done;
  const map = {
    'stat-todo': counts.todo,
    'stat-progress': counts.progress,
    'stat-done': counts.done,
    'stat-total': total,
    'tab-count-todo': counts.todo,
    'tab-count-progress': counts.progress,
    'tab-count-done': counts.done,
  };
  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(val);
  });
}

export function syncMobileProjectContext() {
  const switcher = document.getElementById('mobile-project-switcher');
  const nameEl = document.getElementById('mobile-project-name');
  if (!switcher || !nameEl) return;

  const link = getActiveProjectLink();
  const name = link?.querySelector('.project-item__name')?.textContent.trim() || 'All projects';
  const id = link?.getAttribute('data-id') || '0';

  nameEl.textContent = name;
  switcher.dataset.projectId = id;
  switcher.classList.toggle('mobile-project-switcher--all', id === '0');
  switcher.classList.toggle('mobile-project-switcher--project', id !== '0');
  switcher.setAttribute(
    'aria-label',
    id === '0'
      ? 'Viewing all projects. Tap to switch project.'
      : `Viewing ${name}. Tap to switch project.`
  );
}

export async function reloadTaskBoard(url) {
  const taskContainer = document.getElementById('task-container');
  if (!taskContainer || !url) return;
  const response = await fetch(withSort(url), {
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  });
  if (!response.ok) throw new Error('Failed to load tasks');
  const html = await response.text();
  taskContainer.innerHTML = html;
  const { closeAllTaskMenus } = await import('./tasks.js');
  closeAllTaskMenus();
  syncDashboardStats();
  syncMobileProjectContext();
  initKanbanTabs();
  const { initTaskDatePickers } = await import('./task-date-picker.js');
  initTaskDatePickers(taskContainer);
  const { syncDraggableCards } = await import('./drag-drop.js');
  syncDraggableCards();
  requestAnimationFrame(() => {
    taskContainer.querySelectorAll('.task-card, .task--adv').forEach((el) => {
      el.classList.add('task--enter');
      setTimeout(() => el.classList.remove('task--enter'), 420);
    });
  });
}

export async function postForm(url, formData) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
    body: formData,
  });
  return response;
}

export async function postJson(url, body, csrf) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrf,
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify(body),
  });
  return response;
}

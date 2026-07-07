/** Kanban drag & drop — move tasks between status columns/tabs. */
import { getActiveProjectLink, getCsrfToken, reloadTaskBoard } from './utils.js';
import { NotificationManager } from './notifications.js';
import { switchKanbanTab } from './kanban-tabs.js';

let draggedCard = null;

async function updateTaskStatus(card, newStatus) {
  const editUrl = card.getAttribute('data-edit-url');
  const currentStatus = card.getAttribute('data-status');
  if (!editUrl || !newStatus || currentStatus === newStatus) return false;

  const formData = new FormData();
  formData.append('status', newStatus);
  const csrf = getCsrfToken();
  if (csrf) formData.append('csrfmiddlewaretoken', csrf);

  const response = await fetch(editUrl, {
    method: 'POST',
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
    body: formData,
  });

  if (!response.ok) throw new Error('Status update failed');
  const data = await response.json();
  return data?.status === newStatus;
}

function clearDragState() {
  draggedCard = null;
  document.querySelectorAll('.kanban-column--drag-over').forEach((el) => {
    el.classList.remove('kanban-column--drag-over');
  });
  document.querySelectorAll('.kanban-tab--drag-over').forEach((el) => {
    el.classList.remove('kanban-tab--drag-over');
  });
  document.querySelectorAll('.task-card--dragging').forEach((el) => {
    el.classList.remove('task-card--dragging');
  });
}

function isDraggableCard(el) {
  return el?.classList.contains('task-card') && !el.classList.contains('task--empty') && !el.classList.contains('task--form');
}

function getDropStatus(target) {
  const tab = target?.closest('.kanban-tab');
  if (tab?.dataset.tab) return tab.dataset.tab;

  const column = target?.closest('.kanban-column');
  if (column?.dataset.status) return column.dataset.status;

  return null;
}

async function handleTaskDrop(newStatus) {
  const card = draggedCard;
  clearDragState();
  if (!card || !newStatus || card.getAttribute('data-status') === newStatus) return;

  card.classList.add('task--moving');
  try {
    const ok = await updateTaskStatus(card, newStatus);
    if (ok) {
      switchKanbanTab(newStatus);
      NotificationManager.notify({
        title: 'Task moved',
        description: `${card.getAttribute('data-title') || ''} → ${newStatus}`,
        type: 'update',
      });
      const link = getActiveProjectLink();
      if (link?.dataset.url) await reloadTaskBoard(link.dataset.url);
    }
  } catch (err) {
    console.error('Drag drop error', err);
    card.classList.remove('task--moving');
    NotificationManager.notify({
      title: 'Move failed',
      description: 'Could not update task status',
      type: 'error',
    });
  }
}

export function syncDraggableCards() {
  const touchLike = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024;
  document.querySelectorAll('.task-card').forEach((card) => {
    if (touchLike || card.classList.contains('task--empty') || card.classList.contains('task--form')) {
      card.removeAttribute('draggable');
    } else {
      card.setAttribute('draggable', 'true');
    }
  });
}

export function initDragDrop() {
  const root = document.getElementById('task-container');
  if (!root || root.dataset.dragBound === '1') return;
  root.dataset.dragBound = '1';

  syncDraggableCards();
  window.addEventListener('resize', syncDraggableCards);

  root.addEventListener('dragstart', (e) => {
    if (e.target.closest('button, [data-task-menu], .task-options, .task-option')) {
      e.preventDefault();
      return;
    }

    const card = e.target.closest('.task-card');
    if (!isDraggableCard(card)) {
      e.preventDefault();
      return;
    }

    draggedCard = card;
    card.classList.add('task-card--dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.getAttribute('data-id') || '');
  });

  root.addEventListener('dragend', () => {
    clearDragState();
  });

  root.addEventListener('dragover', (e) => {
    if (!draggedCard) return;

    const tab = e.target.closest('.kanban-tab');
    const cards = e.target.closest('.kanban-column__cards');

    if (!tab && !cards) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    document.querySelectorAll('.kanban-column--drag-over, .kanban-tab--drag-over').forEach((el) => {
      el.classList.remove('kanban-column--drag-over', 'kanban-tab--drag-over');
    });

    if (tab) {
      tab.classList.add('kanban-tab--drag-over');
    } else {
      e.target.closest('.kanban-column')?.classList.add('kanban-column--drag-over');
    }
  });

  root.addEventListener('dragleave', (e) => {
    const tab = e.target.closest('.kanban-tab');
    const column = e.target.closest('.kanban-column');
    const related = e.relatedTarget;

    if (tab && (!related || !tab.contains(related))) {
      tab.classList.remove('kanban-tab--drag-over');
    }
    if (column && (!related || !column.contains(related))) {
      column.classList.remove('kanban-column--drag-over');
    }
  });

  root.addEventListener('drop', (e) => {
    if (!draggedCard) return;

    const newStatus = getDropStatus(e.target);
    if (!newStatus) return;

    e.preventDefault();
    handleTaskDrop(newStatus);
  });
}

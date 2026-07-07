/** Kanban tab switching — To do / In progress / Done. */

let activeKanbanTab = 'todo';

try {
  activeKanbanTab = sessionStorage.getItem('kanban-active-tab') || 'todo';
} catch {
  activeKanbanTab = 'todo';
}

export function switchKanbanTab(status) {
  activeKanbanTab = status;
  try {
    sessionStorage.setItem('kanban-active-tab', status);
  } catch {
    /* ignore storage errors */
  }

  document.querySelectorAll('.kanban-tab').forEach((tab) => {
    const active = tab.dataset.tab === status;
    tab.classList.toggle('kanban-tab--active', active);
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  document.querySelectorAll('.kanban-column').forEach((col) => {
    const active = col.dataset.status === status;
    col.classList.toggle('kanban-column--active', active);
    col.hidden = !active;
  });

  const activeCol = document.querySelector(`.kanban-column[data-status="${status}"]`);
  activeCol?.querySelector('.kanban-column__cards')?.scrollTo(0, 0);
}

export function initKanbanTabs() {
  if (!document.querySelector('.kanban-tabs')) return;
  switchKanbanTab(activeKanbanTab);
}

export function initKanbanTabListeners() {
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('.kanban-tab');
    if (!tab || !document.getElementById('task-container')?.contains(tab)) return;
    switchKanbanTab(tab.dataset.tab);
  });
}

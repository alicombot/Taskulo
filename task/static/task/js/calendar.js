/** Header calendar date picker. */
import { getActiveProjectId, syncDashboardStats } from './utils.js';
import { initKanbanTabs } from './kanban-tabs.js';

export function toggleDatePicker() {
  const picker = document.getElementById('date-picker');
  if (!picker) return;
  if (!picker.hidden) {
    picker.hidden = true;
  } else if (typeof window.__openHeaderCalendar === 'function') {
    window.__openHeaderCalendar();
  } else {
    picker.hidden = false;
  }
}

export function initCalendar() {
  const picker = document.getElementById('date-picker');
  const grid = document.getElementById('calendar-grid');
  const title = document.getElementById('calendar-title');
  const prevBtn = document.querySelector('.calendar__nav--prev');
  const nextBtn = document.querySelector('.calendar__nav--next');
  if (!picker || !grid || !title || !prevBtn || !nextBtn) return;

  let current = new Date();
  let selected = null;
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    title.textContent = `${monthNames[month]} ${year}`;
    grid.innerHTML = '';

    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = document.createElement('div');
      d.className = 'calendar__day calendar__day--muted';
      d.textContent = String(daysInPrevMonth - i);
      grid.appendChild(d);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'calendar__day';
      btn.textContent = String(day);
      const thisDate = new Date(year, month, day);
      const today = new Date();
      if (thisDate.toDateString() === today.toDateString()) {
        btn.classList.add('calendar__day--today');
      }
      if (selected && thisDate.toDateString() === selected.toDateString()) {
        btn.classList.add('calendar__day--selected');
      }
      btn.addEventListener('click', () => {
        selected = thisDate;
        const timeEl = document.querySelector('.nav__item--date .date');
        if (timeEl) {
          timeEl.textContent = `${thisDate.getDate()} ${monthNames[thisDate.getMonth()]} ${thisDate.getFullYear()}`;
        }
        const iso = `${thisDate.getFullYear()}-${String(thisDate.getMonth() + 1).padStart(2, '0')}-${String(thisDate.getDate()).padStart(2, '0')}`;
        const formEl = document.getElementById('search-form');
        const searchUrl = formEl?.dataset.searchUrl;
        const projectId = getActiveProjectId();
        if (searchUrl) {
          fetch(`${searchUrl}?date=${encodeURIComponent(iso)}&project=${encodeURIComponent(projectId)}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
          })
            .then((r) => r.text())
            .then((html) => {
              const taskContainer = document.getElementById('task-container');
              if (taskContainer) taskContainer.innerHTML = html;
              syncDashboardStats();
              initKanbanTabs();
            })
            .catch(() => {});
        }
        picker.hidden = true;
      });
      grid.appendChild(btn);
    }

    const filled = grid.children.length;
    const totalCells = Math.ceil(filled / 7) * 7;
    for (let day = 1; filled + day <= totalCells; day++) {
      const d = document.createElement('div');
      d.className = 'calendar__day calendar__day--muted';
      d.textContent = String(day);
      grid.appendChild(d);
    }
  }

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    current.setMonth(current.getMonth() - 1);
    renderCalendar(current);
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    current.setMonth(current.getMonth() + 1);
    renderCalendar(current);
  });

  window.__openHeaderCalendar = () => {
    renderCalendar(current);
    picker.hidden = false;
  };

  renderCalendar(current);

  document.addEventListener('click', (event) => {
    const dateWrapper = document.querySelector('.nav__item--date');
    if (picker && dateWrapper && !dateWrapper.contains(event.target)) {
      picker.hidden = true;
    }
  });

  const timeEl = document.querySelector('.nav__item--date .date');
  if (timeEl) {
    const now = new Date();
    timeEl.textContent = `${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    timeEl.setAttribute(
      'datetime',
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    );
  }
}

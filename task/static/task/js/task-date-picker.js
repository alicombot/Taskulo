/** Custom due-date picker for task create/edit forms. */

const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

let activePicker = null;

function formatDisplayDate(iso) {
  if (!iso) return '';
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return '';
  return `${day} ${MONTHS_SHORT[month - 1]} ${year}`;
}

function toIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseIsoDate(iso) {
  if (!iso) return null;
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function getTaskDateFieldHtml({ value = '' } = {}) {
  const display = value ? formatDisplayDate(value) : 'Select date';
  const placeholderClass = value ? '' : ' is-placeholder';
  const clearHidden = value ? '' : ' hidden';

  return `
    <div class="task-form__date-field" data-task-date-picker>
      <input type="hidden" name="due_date" class="task-form__date-value" value="${value}">
      <div class="task-form__date-control">
        <button type="button" class="task-form__date-trigger" aria-haspopup="dialog" aria-expanded="false">
          <svg class="task-form__date-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          <span class="task-form__date-text${placeholderClass}">${display}</span>
        </button>
        <button type="button" class="task-form__date-clear" aria-label="Clear date"${clearHidden}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="task-form__date-popover" hidden role="dialog" aria-label="Choose due date">
        <div class="calendar task-form__calendar">
          <div class="calendar__header">
            <button type="button" class="calendar__nav calendar__nav--prev" aria-label="Previous month">‹</button>
            <div class="calendar__title"></div>
            <button type="button" class="calendar__nav calendar__nav--next" aria-label="Next month">›</button>
          </div>
          <div class="calendar__weekdays"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div>
          <div class="calendar__grid"></div>
        </div>
      </div>
    </div>`;
}

function closePicker(field) {
  const popover = field.querySelector('.task-form__date-popover');
  const trigger = field.querySelector('.task-form__date-trigger');
  if (popover) popover.hidden = true;
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
  if (activePicker === field) activePicker = null;
}

function closeAllPickers(except = null) {
  document.querySelectorAll('[data-task-date-picker]').forEach((field) => {
    if (field !== except) closePicker(field);
  });
}

function setPickerValue(field, iso) {
  const hidden = field.querySelector('.task-form__date-value');
  const text = field.querySelector('.task-form__date-text');
  const clearBtn = field.querySelector('.task-form__date-clear');
  if (hidden) hidden.value = iso || '';
  if (text) {
    if (iso) {
      text.textContent = formatDisplayDate(iso);
      text.classList.remove('is-placeholder');
    } else {
      text.textContent = 'Select date';
      text.classList.add('is-placeholder');
    }
  }
  if (clearBtn) {
    if (iso) clearBtn.removeAttribute('hidden');
    else clearBtn.setAttribute('hidden', '');
  }
}

function renderPickerCalendar(field) {
  const grid = field.querySelector('.calendar__grid');
  const title = field.querySelector('.calendar__title');
  const hidden = field.querySelector('.task-form__date-value');
  if (!grid || !title) return;

  const view = field._viewDate || new Date();
  const selected = parseIsoDate(hidden?.value || '');
  const year = view.getFullYear();
  const month = view.getMonth();

  title.textContent = `${MONTHS_FULL[month]} ${year}`;
  grid.innerHTML = '';

  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const today = new Date();

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
    if (thisDate.toDateString() === today.toDateString()) {
      btn.classList.add('calendar__day--today');
    }
    if (selected && thisDate.toDateString() === selected.toDateString()) {
      btn.classList.add('calendar__day--selected');
    }
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setPickerValue(field, toIsoDate(thisDate));
      closePicker(field);
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

function mountTaskDatePicker(field) {
  if (field.dataset.datePickerReady === '1') return;
  field.dataset.datePickerReady = '1';

  const hidden = field.querySelector('.task-form__date-value');
  const trigger = field.querySelector('.task-form__date-trigger');
  const popover = field.querySelector('.task-form__date-popover');
  const clearBtn = field.querySelector('.task-form__date-clear');
  const prevBtn = field.querySelector('.calendar__nav--prev');
  const nextBtn = field.querySelector('.calendar__nav--next');

  field._viewDate = parseIsoDate(hidden?.value || '') || new Date();

  trigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = popover && !popover.hidden;
    closeAllPickers(field);
    if (isOpen) {
      closePicker(field);
      return;
    }
    field._viewDate = parseIsoDate(hidden?.value || '') || new Date();
    renderPickerCalendar(field);
    if (popover) popover.hidden = false;
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    activePicker = field;
  });

  clearBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    setPickerValue(field, '');
    closePicker(field);
  });

  prevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    field._viewDate.setMonth(field._viewDate.getMonth() - 1);
    renderPickerCalendar(field);
  });

  nextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    field._viewDate.setMonth(field._viewDate.getMonth() + 1);
    renderPickerCalendar(field);
  });

  popover?.addEventListener('click', (e) => e.stopPropagation());
}

export function initTaskDatePickers(root = document) {
  root.querySelectorAll('[data-task-date-picker]').forEach(mountTaskDatePicker);
}

document.addEventListener('click', () => {
  if (activePicker) closeAllPickers();
});

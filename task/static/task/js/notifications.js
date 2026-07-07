/** Toast & notification dropdown manager. */
export const NotificationManager = (() => {
  const STORAGE_KEY = 'taskulo_notifications';
  const DEDUPE_WINDOW_MS = 2000;
  const recent = new Map();

  const toastContainer = (() => {
    const el = document.getElementById('toast-container');
    if (el) return el;
    const created = document.createElement('div');
    created.id = 'toast-container';
    created.className = 'toast-container';
    document.body.appendChild(created);
    return created;
  })();

  const dropdown = document.getElementById('notification-options');
  const listEl = document.getElementById('notification-list');

  function loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveAll(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
    } catch {
      /* ignore quota errors */
    }
  }

  function colorClass(type) {
    const map = {
      success: 'green',
      error: 'red',
      warning: 'yellow',
      update: 'blue',
      info: 'blue',
    };
    return map[type] || 'blue';
  }

  function svgIcon(type) {
    const icons = {
      success:
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>',
      error:
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>',
      warning:
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3l9 16H3l9-16Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v5"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 17h.01"/></svg>',
      update:
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12a9 9 0 0 1 15.54-5.94"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 0 1-15.54 5.94"/><path stroke-linecap="round" stroke-linejoin="round" d="M4 7V4h3"/><path stroke-linecap="round" stroke-linejoin="round" d="M20 17v3h-3"/></svg>',
    };
    return (
      icons[type] ||
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"/></svg>'
    );
  }

  function closeIcon() {
    return '<svg xmlns="http://www.w3.org/2000/svg" fill="none" width="18" height="18" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>';
  }

  function renderDropdownItem(item, prepend = true) {
    if (!listEl) return;
    listEl.querySelector('.notification-empty')?.remove();
    const wrapper = document.createElement('div');
    wrapper.className = `notification-option ${colorClass(item.type)}`;
    wrapper.setAttribute('data-id', item.id);
    wrapper.innerHTML = `
      <div class="notification-start-icon">${svgIcon(item.type)}</div>
      <div class="notification-text">
        <div class="notification-title">${item.title || ''}</div>
        <div class="notification-description">${item.description || ''}</div>
      </div>
      <div class="notification-end-icon" data-action="notif-dismiss" aria-label="Dismiss notification">${closeIcon()}</div>`;
    if (prepend) listEl.prepend(wrapper);
    else listEl.appendChild(wrapper);
  }

  function rebuildDropdown() {
    if (!listEl) return;
    listEl.querySelectorAll('.notification-option[data-id]').forEach((el) => el.remove());
    const items = loadAll();
    if (!items.length) {
      if (!listEl.querySelector('.notification-empty')) {
        listEl.innerHTML = `
          <div class="notification-empty">
            <div class="empty-state empty-state--notif">
              <div class="empty-state__icon" aria-hidden="true">🔔</div>
              <div class="empty-state__content">
                <h3 class="empty-state__title">All caught up</h3>
                <p class="empty-state__desc">Notifications will appear when you take action on tasks.</p>
              </div>
            </div>
          </div>`;
      }
      return;
    }
    listEl.querySelector('.notification-empty')?.remove();
    items.forEach((item) => renderDropdownItem(item, false));
  }

  function archive(item) {
    const all = loadAll();
    all.unshift(item);
    saveAll(all);
    renderDropdownItem(item, true);
  }

  function showToast(item) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-item toast-enter pointer-events-auto';
    toast.innerHTML = `
      <div class="notification-option ${colorClass(item.type)}" style="margin:0">
        <div class="notification-start-icon">${svgIcon(item.type)}</div>
        <div class="notification-text">
          <div class="notification-title">${item.title || ''}</div>
          <div class="notification-description">${item.description || ''}</div>
        </div>
      </div>`;
    toastContainer.appendChild(toast);

    let closed = false;
    const closeNow = () => {
      if (closed) return;
      closed = true;
      toast.classList.add('toast-leave');
      setTimeout(() => toast.remove(), 260);
    };
    setTimeout(() => {
      closeNow();
      archive(item);
    }, 5000);
  }

  function notify({ title = '', description = '', type = 'info' }) {
    const key = `${type}|${title}|${description}`;
    const now = Date.now();
    if (now - (recent.get(key) || 0) < DEDUPE_WINDOW_MS) return;
    recent.set(key, now);
    showToast({
      id: `${Date.now()}${Math.random().toString(36).slice(2)}`,
      title,
      description,
      type,
      ts: now,
    });
  }

  function init() {
    rebuildDropdown();
    dropdown?.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('[data-action="notif-dismiss"]');
      if (!closeBtn) return;
      e.stopPropagation();
      const option = closeBtn.closest('.notification-option[data-id]');
      if (!option) return;
      const id = option.getAttribute('data-id');
      option.remove();
      saveAll(loadAll().filter((it) => it.id !== id));
      if (!listEl?.querySelector('.notification-option[data-id]')) {
        const empty = document.createElement('div');
        empty.className = 'notification-empty';
        empty.innerHTML = `
          <div class="empty-state empty-state--notif">
            <div class="empty-state__icon" aria-hidden="true">🔔</div>
            <div class="empty-state__content">
              <h3 class="empty-state__title">All caught up</h3>
              <p class="empty-state__desc">Notifications will appear when you take action on tasks.</p>
            </div>
          </div>`;
        listEl?.appendChild(empty);
      }
    });
  }

  return { notify, init, rebuildDropdown };
})();

export function toggleNotificationOptions() {
  const el = document.getElementById('notification-options');
  if (!el) return;
  el.hidden = !el.hidden;
}

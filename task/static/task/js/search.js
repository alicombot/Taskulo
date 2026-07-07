/** Task search with autocomplete suggestions. */
import { debounce, getActiveProjectId, syncDashboardStats, withSort } from './utils.js';
import { initKanbanTabs } from './kanban-tabs.js';

let performSearchRef = null;

export function initSearch() {
  const form = document.getElementById('search-form');
  if (!form) return;

  const input = document.getElementById('search-input');
  const btn = document.getElementById('search-btn');
  const suggestBox = document.getElementById('search-suggestions');
  const suggestUrl = form.dataset.suggestUrl;
  const searchUrl = form.dataset.searchUrl;

  function renderSuggestions(items) {
    if (!suggestBox) return;
    suggestBox.innerHTML = '';
    if (!items?.length) {
      const empty = document.createElement('div');
      empty.className = 'search-suggestion';
      empty.textContent = 'No results';
      suggestBox.appendChild(empty);
    } else {
      items.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'search-suggestion';
        div.textContent = item.title;
        div.dataset.id = item.id;
        div.dataset.status = item.status;
        suggestBox.appendChild(div);
      });
    }
    suggestBox.hidden = false;
  }

  function clearSuggestions() {
    if (!suggestBox) return;
    suggestBox.innerHTML = '';
    suggestBox.hidden = true;
  }

  const fetchSuggest = debounce((q) => {
    if (!q?.trim()) {
      clearSuggestions();
      return;
    }
    if (!suggestUrl) return;
    fetch(`${suggestUrl}?q=${encodeURIComponent(q)}`, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((data) => renderSuggestions(data?.results || []))
      .catch(clearSuggestions);
  }, 200);

  function performSearch(q) {
    if (!searchUrl) return;
    const project = getActiveProjectId();
    const base = `${searchUrl}?q=${encodeURIComponent(q || '')}&project=${encodeURIComponent(project)}`;
    fetch(withSort(base), { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then((r) => r.text())
      .then((html) => {
        const taskContainer = document.getElementById('task-container');
        if (taskContainer) taskContainer.innerHTML = html;
        syncDashboardStats();
        initKanbanTabs();
        clearSuggestions();
      })
      .catch(() => {});
  }

  performSearchRef = performSearch;

  input?.addEventListener('input', function () {
    fetchSuggest(this.value);
  });

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch(input.value);
    }
  });

  input?.addEventListener('focus', function () {
    if (this.value?.trim()) fetchSuggest(this.value);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    performSearch(input?.value || '');
  });

  form.addEventListener('submit-search', () => {
    performSearch(input?.value || '');
  });

  btn?.addEventListener('click', () => performSearch(input?.value || ''));

  suggestBox?.addEventListener('click', (e) => {
    const item = e.target.closest('.search-suggestion');
    if (!item || !input) return;
    input.value = item.textContent.trim();
    performSearch(input.value);
  });

  document.addEventListener('click', (e) => {
    if (!form.contains(e.target)) clearSuggestions();
  });
}

export function performSearch(q) {
  performSearchRef?.(q);
}

/** Sidebar navigation & panel management. */
import { closeProjectForms } from './projects.js';
import { getActiveProjectLink, reloadTaskBoard, syncMobileProjectContext, toggleDisplay } from './utils.js';

const titlePanelHead = document.querySelector('.panel__title');

function syncPanelBackdrop() {
  const panel = document.querySelector('.panel');
  const backdrop = document.getElementById('panel-backdrop');
  if (!backdrop || window.innerWidth >= 1024) {
    backdrop?.setAttribute('hidden', '');
    return;
  }
  const isOpen = panel && !panel.classList.contains('paenl--close');
  if (isOpen) backdrop.removeAttribute('hidden');
  else backdrop.setAttribute('hidden', '');
}

export function openProjectsPanel() {
  closeMobileProjectPicker();
  openSidebarContent('#panel-home');
}

function openProjectsPanelFromPicker() {
  closeMobileProjectPicker();
  window.requestAnimationFrame(() => {
    openSidebarContent('#panel-home');
  });
}

function resolveProjectUrl(projectLink) {
  let url = projectLink.dataset.url;
  if (!url || url === '#') {
    const id = projectLink.getAttribute('data-id');
    if (id) {
      url = `/dashboard/projects/${id}/tasks/`;
      projectLink.setAttribute('data-url', url);
    }
  }
  return url;
}

function selectProject(projectLink) {
  if (!projectLink) return;

  const url = resolveProjectUrl(projectLink);
  if (!url) return;

  document.querySelectorAll('.project-item.project-link.is-active').forEach((el) => {
    el.classList.remove('is-active');
  });
  projectLink.classList.add('is-active');
  syncMobileProjectContext();
  closeMobileProjectPicker();
  if (!isDesktopLayout()) closePanel();

  reloadTaskBoard(url).catch((err) =>
    console.error('Error loading project tasks:', err)
  );
}

function renderMobileProjectPickerList() {
  const list = document.getElementById('mobile-project-picker-list');
  const source = document.getElementById('project-list');
  if (!list || !source) return;

  list.innerHTML = '';
  source.querySelectorAll('.project-item.project-link').forEach((item) => {
    const id = item.dataset.id || '0';
    const name = item.querySelector('.project-item__name')?.textContent.trim() || 'Project';
    const meta = item.querySelector('.project-item__meta')?.textContent.trim() || '';
    const isActive = item.classList.contains('is-active');
    const isAll = id === '0';

    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `mobile-project-picker__option${isActive ? ' is-active' : ''}${isAll ? '' : ' mobile-project-picker__option--project'}`;
    btn.dataset.projectId = id;
    btn.innerHTML = `
      <span class="mobile-project-picker__option-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"/></svg>
      </span>
      <span class="mobile-project-picker__option-dot" aria-hidden="true"></span>
      <span class="mobile-project-picker__option-body">
        <span class="mobile-project-picker__option-name"></span>
        ${meta ? '<span class="mobile-project-picker__option-meta"></span>' : ''}
      </span>
      <svg class="mobile-project-picker__check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
    `;

    btn.querySelector('.mobile-project-picker__option-name').textContent = name;
    const metaEl = btn.querySelector('.mobile-project-picker__option-meta');
    if (metaEl) metaEl.textContent = meta;

    btn.addEventListener('click', () => {
      selectProject(item);
    });

    li.appendChild(btn);
    list.appendChild(li);
  });
}

function openMobileProjectPicker() {
  if (window.innerWidth >= 1024) {
    openProjectsPanel();
    return;
  }

  const picker = document.getElementById('mobile-project-picker');
  const switcher = document.getElementById('mobile-project-switcher');
  if (!picker) return;

  renderMobileProjectPickerList();
  picker.hidden = false;
  switcher?.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMobileProjectPicker() {
  const picker = document.getElementById('mobile-project-picker');
  const switcher = document.getElementById('mobile-project-switcher');
  if (!picker || picker.hidden) return;

  picker.hidden = true;
  switcher?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

function openSidebarContent(contentId) {
  const contentElement = document.querySelector(contentId);
  if (!contentElement) return;

  document.querySelector('.menu-list__item--active')?.classList.remove('menu-list__item--active');
  document.querySelector('.panel__content.content--show')?.classList.remove('content--show');

  document
    .querySelector(`.menu-list__item[data-content-id="${contentId}"]`)
    ?.classList.add('menu-list__item--active');

  contentElement.classList.add('content--show');
  document.querySelector('.panel')?.classList.remove('paenl--close');
  document.querySelector('.wrapper')?.classList.add('wrapper--close');
  syncPanelBackdrop();

  if (titlePanelHead) {
    const titles = {
      '#panel-account': 'Account',
      '#panel-home': 'Projects',
      '#panel-messages': 'Messages',
    };
    titlePanelHead.textContent = titles[contentId] || 'Projects';
  }
}

function closePanel() {
  document.querySelector('.panel')?.classList.add('paenl--close');
  document.querySelector('.wrapper')?.classList.remove('wrapper--close');
  document.querySelector('.menu-list__item--active')?.classList.remove('menu-list__item--active');
  document.querySelector('.panel__content.content--show')?.classList.remove('content--show');
  closeProjectForms();
  syncPanelBackdrop();
  closeMobileProjectPicker();
}

function isDesktopLayout() {
  return window.innerWidth >= 1024;
}

function initPanelLayout() {
  if (isDesktopLayout()) {
    openSidebarContent('#panel-home');
  } else {
    closePanel();
  }
}

export function initSidebar() {
  const headerProfile = document.querySelector('.nav__item--profile');

  headerProfile?.addEventListener('click', () => {
    const panel = document.querySelector('.panel');
    const isPanelOpen = panel && !panel.classList.contains('paenl--close');
    const isAccountActive = document
      .querySelector('#panel-account')
      ?.classList.contains('content--show');

    if (isPanelOpen && isAccountActive) {
      closePanel();
      return;
    }
    openSidebarContent('#panel-account');
  });

  document.querySelectorAll('.menu-list__item').forEach((item) => {
    item.addEventListener('click', (e) => {
      if (item.id === 'panel-theme-toggle') return;
      e.preventDefault();

      const contentId = item.getAttribute('data-content-id');
      const contentElement = document.querySelector(contentId);
      const activeItem = document.querySelector('.menu-list__item--active');
      const activeContent = document.querySelector('.panel__content.content--show');

      if (activeItem === item) {
        item.classList.remove('menu-list__item--active');
        activeContent?.classList.remove('content--show');
        document.querySelector('.panel')?.classList.add('paenl--close');
        document.querySelector('.wrapper')?.classList.remove('wrapper--close');
        syncPanelBackdrop();
      } else {
        activeItem?.classList.remove('menu-list__item--active');
        activeContent?.classList.remove('content--show');
        item.classList.add('menu-list__item--active');
        contentElement?.classList.add('content--show');
        document.querySelector('.panel')?.classList.remove('paenl--close');
        document.querySelector('.wrapper')?.classList.add('wrapper--close');
        syncPanelBackdrop();

        if (titlePanelHead && contentId) {
          const titles = {
            '#panel-account': 'Account',
            '#panel-home': 'Projects',
            '#panel-messages': 'Messages',
          };
          titlePanelHead.textContent = titles[contentId] || 'Projects';
        }
      }
    });
  });

  document.querySelectorAll('.manage-list__wrapper').forEach((wrapper) => {
    wrapper.addEventListener('click', () => {
      const content = wrapper.nextElementSibling;
      wrapper.classList.toggle('manage-list--active');
      content?.classList.toggle('manage-list__content--active');
    });
  });

  document.addEventListener('click', (event) => {
    const projectLink = event.target.closest('.project-link');
    if (
      !projectLink ||
      event.target.closest('.project-item__actions, .project-create, .project-edit')
    ) {
      return;
    }
    event.preventDefault();
    selectProject(projectLink);
  });

  document.getElementById('mobile-project-switcher')?.addEventListener('click', () => {
    const picker = document.getElementById('mobile-project-picker');
    if (picker && !picker.hidden) closeMobileProjectPicker();
    else openMobileProjectPicker();
  });

  document.getElementById('mobile-project-picker-backdrop')?.addEventListener('click', closeMobileProjectPicker);
  document.getElementById('mobile-project-picker-close')?.addEventListener('click', closeMobileProjectPicker);
  document.getElementById('mobile-project-picker-manage')?.addEventListener('click', () => {
    openProjectsPanelFromPicker();
  });

  document.getElementById('panel-backdrop')?.addEventListener('click', closePanel);

  document.addEventListener('click', (event) => {
    if (window.innerWidth >= 1024) return;
    const panel = document.querySelector('.panel');
    if (!panel || panel.classList.contains('paenl--close')) return;
    const sidebar = document.querySelector('.sidebar');
    const panelEl = document.querySelector('.panel');
    if (sidebar?.contains(event.target) || panelEl?.contains(event.target)) return;
    closePanel();
  });

  let wasDesktop = isDesktopLayout();

  window.addEventListener('resize', () => {
    const desktop = isDesktopLayout();
    if (desktop && !wasDesktop) {
      closeMobileProjectPicker();
      openSidebarContent('#panel-home');
    } else if (!desktop && wasDesktop) {
      closePanel();
    }
    wasDesktop = desktop;
    syncPanelBackdrop();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileProjectPicker();
  });

  initPanelLayout();
  syncPanelBackdrop();
  syncMobileProjectContext();
}

export function toggleSortOptions() {
  const sortWrapper = document.querySelector('.sort__wrapper');
  const sortOptions = document.getElementById('sort-options');
  if (!sortOptions || !sortWrapper) return;
  const open = toggleDisplay(sortOptions);
  sortWrapper.classList.toggle('open', open);
  sortWrapper.setAttribute('aria-expanded', open ? 'true' : 'false');
}

export function selectOption(option) {
  const sortText = document.querySelector('.sort__text');
  const sortOptions = document.getElementById('sort-options');
  const sortWrapper = document.querySelector('.sort__wrapper');

  if (sortText) sortText.textContent = option;
  sortOptions?.querySelectorAll('.sort-option').forEach((el) => {
    el.classList.toggle('active', el.textContent.trim() === option.trim());
  });
  if (sortOptions) {
    sortOptions.hidden = true;
  }
  sortWrapper?.classList.remove('open');
  sortWrapper?.setAttribute('aria-expanded', 'false');

  const input = document.getElementById('search-input');
  if (input?.value?.trim()) {
    document.getElementById('search-form')?.dispatchEvent(new Event('submit-search'));
    return;
  }

  const link = getActiveProjectLink();
  if (link?.dataset.url) {
    reloadTaskBoard(link.dataset.url).catch(console.error);
  }
}

export function initSortDropdown() {
  document.addEventListener('click', (event) => {
    const sortWrapper = document.querySelector('.sort__wrapper');
    const sortOptions = document.getElementById('sort-options');
    if (sortOptions && sortWrapper && !sortWrapper.contains(event.target)) {
      sortOptions.hidden = true;
      sortWrapper.classList.remove('open');
      sortWrapper.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('click', (event) => {
    const notifWrapper = document.querySelector('.nav__item--notification');
    const notifOptions = document.getElementById('notification-options');
    if (notifOptions?.contains(event.target)) {
      event.stopPropagation();
      return;
    }
    if (notifOptions && notifWrapper && !notifWrapper.contains(event.target)) {
      notifOptions.hidden = true;
    }
  });
}

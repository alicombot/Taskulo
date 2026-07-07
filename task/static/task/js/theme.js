/** Premium light / dark theme manager with animated toggle. */
const STORAGE_KEY = 'taskulo-theme';

export const ThemeManager = (() => {
  function getStoredTheme() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function getActiveTheme() {
    const stored = getStoredTheme();
    if (stored === 'light' || stored === 'dark') return stored;
    return getSystemTheme();
  }

  function isDark() {
    return document.documentElement.classList.contains('dark');
  }

  function updateToggleUI(theme) {
    const toggle = document.getElementById('panel-theme-toggle');
    if (!toggle) return;
    const isDarkTheme = theme === 'dark';
    toggle.setAttribute('aria-checked', String(isDarkTheme));
    toggle.setAttribute(
      'aria-label',
      isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'
    );
  }

  let animateTimer = null;
  function enableThemeTransition() {
    const root = document.documentElement;
    root.classList.add('theme-animating');
    window.clearTimeout(animateTimer);
    animateTimer = window.setTimeout(() => {
      root.classList.remove('theme-animating');
    }, 500);
  }

  function applyTheme(theme, persist = false) {
    const isDarkTheme = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDarkTheme);
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('theme-dark', isDarkTheme);
    document.body.classList.toggle('theme-light', !isDarkTheme);
    updateToggleUI(theme);
    if (persist) localStorage.setItem(STORAGE_KEY, theme);
  }

  function toggleTheme() {
    enableThemeTransition();
    applyTheme(isDark() ? 'light' : 'dark', true);
  }

  function init() {
    applyTheme(getActiveTheme(), false);
    const toggle = document.getElementById('panel-theme-toggle');
    toggle?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleTheme();
    });
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (event) => {
        if (!getStoredTheme()) {
          enableThemeTransition();
          applyTheme(event.matches ? 'dark' : 'light', false);
        }
      });
  }

  return { init, toggleTheme, getActiveTheme, applyTheme };
})();

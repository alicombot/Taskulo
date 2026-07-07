const ThemeManager = (() => {
    'use strict';

    const KEY = 'taskulo-theme';

    function stored() {
        return localStorage.getItem(KEY);
    }

    function system() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function resolve() {
        const saved = stored();
        return (saved === 'light' || saved === 'dark') ? saved : system();
    }

    function isDark() {
        return document.documentElement.classList.contains('dark');
    }

    function updateUI(theme) {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;
        const dark = theme === 'dark';
        btn.setAttribute('aria-checked', String(dark));
        btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    }

    function apply(theme, persist) {
        const dark = theme === 'dark';
        document.documentElement.classList.toggle('dark', dark);
        document.documentElement.setAttribute('data-theme', theme);
        document.body?.classList.toggle('dark', dark);
        updateUI(theme);
        if (persist) localStorage.setItem(KEY, theme);
    }

    function toggle() {
        apply(isDark() ? 'light' : 'dark', true);
    }

    function bind() {
        const btn = document.getElementById('theme-toggle');
        if (!btn || btn.dataset.themeBound === '1') return;
        btn.dataset.themeBound = '1';
        btn.addEventListener('click', toggle);
    }

    function init() {
        apply(resolve(), false);
        bind();
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!stored()) apply(e.matches ? 'dark' : 'light', false);
        });
    }

    function boot() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }

    return { boot, init, toggle, apply };
})();

ThemeManager.boot();

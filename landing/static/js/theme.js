/**
 * Premium light / dark theme manager with animated switch.
 */
const ThemeManager = (() => {
    'use strict';

    const STORAGE_KEY = 'taskulo-theme';

    function getStoredTheme() {
        return localStorage.getItem(STORAGE_KEY);
    }

    function getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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
        const toggle = document.getElementById('theme-toggle');
        if (!toggle) return;

        const isDarkTheme = theme === 'dark';
        toggle.setAttribute('aria-checked', String(isDarkTheme));
        toggle.setAttribute('aria-label', isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme');
    }

    function applyTheme(theme, persist) {
        const isDarkTheme = theme === 'dark';
        document.documentElement.classList.toggle('dark', isDarkTheme);
        document.documentElement.setAttribute('data-theme', theme);
        updateToggleUI(theme);

        if (persist) {
            localStorage.setItem(STORAGE_KEY, theme);
        }
    }

    function toggleTheme() {
        const nextTheme = isDark() ? 'light' : 'dark';
        applyTheme(nextTheme, true);
    }

    function init() {
        applyTheme(getActiveTheme(), false);

        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', toggleTheme);
        }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
            if (!getStoredTheme()) {
                applyTheme(event.matches ? 'dark' : 'light', false);
            }
        });
    }

    return { init, toggleTheme, getActiveTheme };
})();

document.addEventListener('DOMContentLoaded', ThemeManager.init);

const AccountUtils = (() => {
    'use strict';

    const INVISIBLE = /[\u200B-\u200D\uFEFF]/g;

    function getCookie(name) {
        if (!document.cookie) return null;
        const prefix = `${name}=`;
        for (const raw of document.cookie.split(';')) {
            const c = raw.trim();
            if (c.startsWith(prefix)) return decodeURIComponent(c.slice(prefix.length));
        }
        return null;
    }

    function getCsrfToken() {
        return getCookie('csrftoken');
    }

    function sanitizeEmail(v) {
        return v ? String(v).trim().replace(INVISIBLE, '') : '';
    }

    function formatCountdown(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    async function postForm(url, fields) {
        const fd = new FormData();
        const csrf = getCsrfToken();
        Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
        if (csrf) fd.append('csrfmiddlewaretoken', csrf);
        const res = await fetch(url, {
            method: 'POST',
            body: fd,
            headers: csrf ? { 'X-CSRFToken': csrf } : {},
        });
        return res.json();
    }

    function show(el) {
        if (!el) return;
        el.hidden = false;
        el.classList.remove('hidden');
        el.style.display = '';
    }

    function hide(el) {
        if (!el) return;
        el.hidden = true;
        el.classList.add('hidden');
        el.style.display = 'none';
    }

    return { getCsrfToken, sanitizeEmail, formatCountdown, postForm, show, hide };
})();

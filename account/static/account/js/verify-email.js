const VerifyEmail = (() => {
    'use strict';

    const URL = '/account/verify-email/';

    const el = {
        inputs: () => document.querySelectorAll('.verify-code-input'),
        verifyBtn: () => document.getElementById('verifyBtn'),
        resendBtn: () => document.getElementById('resendBtn'),
        error: () => document.getElementById('errorMessage'),
        success: () => document.getElementById('successMessage'),
        email: () => document.getElementById('emailDisplay'),
        countdown: () => document.getElementById('countdown'),
        timer: () => document.getElementById('countdownTimer'),
    };

    let interval = null;
    let cooldown = 0;

    function active() {
        return Boolean(el.verifyBtn() && el.inputs().length);
    }

    function getEmail() {
        const display = el.email();
        const params = new URLSearchParams(location.search);
        const raw = params.get('email') || localStorage.getItem('email') || display?.textContent || '';
        const email = AccountUtils.sanitizeEmail(raw);
        if (display) display.textContent = email;
        return email;
    }

    function code() {
        return Array.from(el.inputs()).map((i) => i.value).join('');
    }

    function clearInputs() {
        el.inputs().forEach((i) => { i.value = ''; i.classList.remove('filled'); });
        el.inputs()[0]?.focus();
    }

    function updateBtn() {
        const btn = el.verifyBtn();
        if (btn) btn.disabled = !Array.from(el.inputs()).every((i) => i.value);
    }

    function showErr(msg) {
        const err = el.error();
        const ok = el.success();
        if (err) err.textContent = msg;
        AccountUtils.show(err);
        AccountUtils.hide(ok);
        clearInputs();
        if (el.verifyBtn()) el.verifyBtn().disabled = true;
    }

    function showOk(msg) {
        const err = el.error();
        const ok = el.success();
        if (ok) ok.textContent = msg;
        AccountUtils.show(ok);
        AccountUtils.hide(err);
        if (el.verifyBtn()) el.verifyBtn().disabled = true;
    }

    function hideMsgs() {
        AccountUtils.hide(el.error());
        AccountUtils.hide(el.success());
    }

    function setLoading(btn, on, busy, idle) {
        if (!btn) return;
        btn.disabled = on;
        btn.textContent = on ? busy : idle;
    }

    function startCooldown(sec) {
        const resend = el.resendBtn();
        const cd = el.countdown();
        const tm = el.timer();
        if (!resend || !cd || !tm) return;
        if (interval) clearInterval(interval);
        cooldown = sec;
        resend.disabled = true;
        AccountUtils.show(cd);
        tm.textContent = AccountUtils.formatCountdown(cooldown);
        interval = setInterval(() => {
            cooldown -= 1;
            tm.textContent = AccountUtils.formatCountdown(cooldown);
            if (cooldown <= 0) {
                clearInterval(interval);
                interval = null;
                resend.disabled = false;
                AccountUtils.hide(cd);
            }
        }, 1000);
    }

    function onInput(e, idx, inputs) {
        const v = e.target.value;
        if (!/^\d$/.test(v)) { e.target.value = ''; return; }
        e.target.classList.add('filled');
        if (idx < inputs.length - 1) inputs[idx + 1].focus();
        updateBtn();
    }

    function onKey(e, idx, inputs) {
        if (e.key === 'Backspace' && !e.target.value && idx > 0) inputs[idx - 1].focus();
        if (e.key === 'ArrowLeft' && idx > 0) inputs[idx - 1].focus();
        if (e.key === 'ArrowRight' && idx < inputs.length - 1) inputs[idx + 1].focus();
    }

    function onPaste(e, inputs) {
        e.preventDefault();
        const p = e.clipboardData.getData('text').replace(/\D/g, '');
        if (p.length !== 4) return;
        inputs.forEach((i, n) => { i.value = p[n] || ''; i.classList.toggle('filled', !!i.value); });
        updateBtn();
        inputs[3].focus();
    }

    async function verify() {
        const btn = el.verifyBtn();
        const c = code();
        if (c.length !== 4) { showErr('Please enter a complete 4-digit code'); return; }
        setLoading(btn, true, 'Verifying...', 'Verify Email');
        hideMsgs();
        try {
            const data = await AccountUtils.postForm(URL, { email: getEmail(), verification_code: c });
            if (data.success) {
                showOk('Email verified successfully! Redirecting...');
                localStorage.setItem('emailVerified', 'true');
                setTimeout(() => { location.href = data.redirect_url || '/account/login/'; }, 2000);
            } else {
                showErr(data.message || 'Invalid verification code. Please try again.');
            }
        } catch {
            showErr('An error occurred. Please try again.');
        } finally {
            setLoading(btn, false, 'Verifying...', 'Verify Email');
            updateBtn();
        }
    }

    async function resend() {
        const btn = el.resendBtn();
        setLoading(btn, true, 'Sending...', 'Resend Code');
        hideMsgs();
        try {
            const data = await AccountUtils.postForm(URL, { email: getEmail(), action: 'resend' });
            if (data.success) {
                showOk('New verification code sent to your email!');
                startCooldown(typeof data.remaining_seconds === 'number' ? data.remaining_seconds : 120);
            } else {
                if (data.remaining_seconds > 0) startCooldown(data.remaining_seconds);
                showErr(data.message || 'Failed to send verification code.');
            }
        } catch {
            showErr('An error occurred. Please try again.');
        } finally {
            if (cooldown <= 0) setLoading(btn, false, 'Sending...', 'Resend Code');
        }
    }

    function init() {
        if (!active()) return;
        getEmail();
        hideMsgs();
        const inputs = Array.from(el.inputs());
        inputs.forEach((input, idx) => {
            input.addEventListener('input', (e) => onInput(e, idx, inputs));
            input.addEventListener('keydown', (e) => onKey(e, idx, inputs));
            input.addEventListener('paste', (e) => onPaste(e, inputs));
        });
        const rem = parseInt(el.resendBtn()?.getAttribute('data-remaining') || '0', 10);
        if (!Number.isNaN(rem) && rem > 0) startCooldown(rem);
        el.verifyBtn()?.addEventListener('click', verify);
        el.resendBtn()?.addEventListener('click', resend);
        inputs[0]?.focus();
        updateBtn();
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', VerifyEmail.init);

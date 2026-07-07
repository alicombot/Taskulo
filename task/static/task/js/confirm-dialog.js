/** Custom confirm dialog — replaces native browser confirm(). */

let resolvePending = null;

function getElements() {
  return {
    root: document.getElementById('app-confirm'),
    title: document.getElementById('app-confirm-title'),
    message: document.getElementById('app-confirm-message'),
    cancelBtn: document.getElementById('app-confirm-cancel'),
    confirmBtn: document.getElementById('app-confirm-confirm'),
    backdrop: document.getElementById('app-confirm-backdrop'),
    dialog: document.querySelector('.app-confirm__dialog'),
  };
}

function finish(result) {
  const { root } = getElements();
  if (!root || root.hidden) return;

  root.hidden = true;
  document.body.style.overflow = '';
  const resolver = resolvePending;
  resolvePending = null;
  resolver?.(result);
}

function bindConfirmDialog() {
  const { cancelBtn, confirmBtn, backdrop, dialog, root } = getElements();
  if (!root || root.dataset.bound === 'true') return;

  cancelBtn?.addEventListener('click', () => finish(false));
  backdrop?.addEventListener('click', () => finish(false));
  confirmBtn?.addEventListener('click', () => finish(true));

  dialog?.addEventListener('click', (event) => event.stopPropagation());

  document.addEventListener('keydown', (event) => {
    if (root?.hidden) return;
    if (event.key === 'Escape') finish(false);
  });

  root.dataset.bound = 'true';
}

/**
 * @param {Object} options
 * @param {string} options.title
 * @param {string} [options.message]
 * @param {string} [options.confirmText]
 * @param {string} [options.cancelText]
 * @param {'danger'|'default'} [options.variant]
 * @returns {Promise<boolean>}
 */
export function showConfirmDialog({
  title,
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}) {
  bindConfirmDialog();

  const { root, title: titleEl, message: messageEl, cancelBtn, confirmBtn, dialog } =
    getElements();
  if (!root || !titleEl || !messageEl || !confirmBtn || !cancelBtn) {
    return Promise.resolve(window.confirm(message || title));
  }

  if (resolvePending) finish(false);

  titleEl.textContent = title;
  messageEl.textContent = message;
  messageEl.hidden = !message;
  cancelBtn.textContent = cancelText;
  confirmBtn.textContent = confirmText;

  dialog?.classList.toggle('app-confirm__dialog--danger', variant === 'danger');
  confirmBtn.classList.toggle('app-confirm__btn--danger', variant === 'danger');
  confirmBtn.classList.toggle('app-confirm__btn--primary', variant !== 'danger');

  root.hidden = false;
  document.body.style.overflow = 'hidden';
  cancelBtn.focus();

  return new Promise((resolve) => {
    resolvePending = resolve;
  });
}

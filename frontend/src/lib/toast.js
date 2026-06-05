let toastEl = null;
let toastTimer = null;

function showToast(msg, type) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.style.cssText =
      'position:fixed;top:20px;left:50%;transform:translateX(-50%);' +
      'color:#fff;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:600;' +
      'z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.25);max-width:420px;' +
      'text-align:center;transition:opacity .2s;pointer-events:none;';
    document.body.appendChild(toastEl);
  }
  toastEl.style.background = type === 'success' ? '#2e7d32' : '#e53e3e';
  toastEl.textContent = msg;
  toastEl.style.opacity = '1';
  toastEl.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.style.opacity = '0';
    setTimeout(() => { toastEl.style.display = 'none'; }, 200);
  }, 3500);
}

export const toast = {
  success: (msg) => showToast(msg, 'success'),
  error:   (msg) => showToast(msg, 'error'),
};

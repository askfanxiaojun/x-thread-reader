const STYLE_ID = 'xtr-toast-style';
const TOAST_CLASS = 'xtr-toast';

const CSS = /* css */ `
  .${TOAST_CLASS} {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #1d9bf0;
    color: #fff;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    z-index: 99999;
    pointer-events: none;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    animation: xtr-fadein 0.3s ease;
  }

  .${TOAST_CLASS}.error {
    background: #f4212e;
  }

  @keyframes xtr-fadein {
    from { opacity: 0; transform: translateX(-50%) translateY(8px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

export function showToast(message: string, isError = false, duration = 3500) {
  ensureStyles();
  const toast = document.createElement('div');
  toast.className = TOAST_CLASS + (isError ? ' error' : '');
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

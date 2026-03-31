const t = (key: string, substitutions?: string | string[]) =>
  browser.i18n.getMessage(key, substitutions);

type AppState =
  | { status: 'detecting' }
  | { status: 'not-x' }
  | { status: 'not-thread' }
  | { status: 'ready' }
  | { status: 'loading'; message: string; count?: number }
  | { status: 'done'; markdown: string; count: number }
  | { status: 'error'; message: string };

const app = document.getElementById('app')!;
let tabId: number | null = null;

function render(state: AppState) {
  switch (state.status) {
    case 'detecting':
      app.innerHTML = `<div class="state-msg"><div class="spinner"></div><span>${t('detecting')}</span></div>`;
      break;

    case 'not-x':
      app.innerHTML = `
        <div class="state-msg hint">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#536471" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>${t('notX')}</p>
        </div>`;
      break;

    case 'not-thread':
      app.innerHTML = `
        <div class="state-msg hint">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#536471" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>${t('notThread')}<br><small>${t('notThreadHint')}</small></p>
        </div>`;
      break;

    case 'ready':
      app.innerHTML = `
        <div class="state-ready">
          <p class="ready-hint">${t('readyHint')}</p>
          <button id="btn-extract" class="btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
            </svg>
            ${t('btnExtract')}
          </button>
        </div>`;
      document.getElementById('btn-extract')!.addEventListener('click', startExtract);
      break;

    case 'loading': {
      const countLabel = state.count
        ? `<em class="count">${t('loadingCount', [String(state.count)])}</em>`
        : '';
      app.innerHTML = `
        <div class="state-loading">
          <div class="loading-row">
            <div class="spinner"></div>
            <span class="loading-msg">${escHtml(state.message)}${countLabel}</span>
          </div>
          <p class="loading-tip">${t('loadingTip')}</p>
        </div>`;
      break;
    }

    case 'done':
      app.innerHTML = `
        <div class="state-done">
          <div class="done-meta">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>${escHtml(t('doneCount', [String(state.count)]))}</span>
          </div>
          <textarea id="md-output" readonly>${escHtml(state.markdown)}</textarea>
          <div class="btn-row">
            <button id="btn-copy" class="btn-primary">${t('btnCopy')}</button>
            <button id="btn-download" class="btn-secondary">${t('btnDownload')}</button>
          </div>
          <button id="btn-back" class="btn-ghost">${t('btnBack')}</button>
        </div>`;
      document.getElementById('btn-copy')!.addEventListener('click', () => copyMarkdown(state.markdown));
      document.getElementById('btn-download')!.addEventListener('click', () => downloadMarkdown(state.markdown));
      document.getElementById('btn-back')!.addEventListener('click', () => render({ status: 'ready' }));
      break;

    case 'error':
      app.innerHTML = `
        <div class="state-msg hint error">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <p>${escHtml(state.message)}</p>
          <button id="btn-retry" class="btn-ghost">${t('btnRetry')}</button>
        </div>`;
      document.getElementById('btn-retry')!.addEventListener('click', () => render({ status: 'ready' }));
      break;
  }
}

async function startExtract() {
  if (!tabId) return;
  render({ status: 'loading', message: t('loadingThread') });

  try {
    await browser.tabs.sendMessage(tabId, { type: 'EXTRACT_THREAD' });
  } catch {
    render({ status: 'error', message: t('errConnect') });
  }
}

function copyMarkdown(markdown: string) {
  navigator.clipboard.writeText(markdown).then(() => {
    const btn = document.getElementById('btn-copy');
    if (!btn) return;
    const orig = btn.textContent!;
    btn.textContent = t('btnCopied');
    setTimeout(() => { if (btn) btn.textContent = orig; }, 2000);
  });
}

function downloadMarkdown(markdown: string) {
  const handleMatch = markdown.match(/@(\w+)/);
  const handle = handleMatch ? handleMatch[1] : 'thread';
  const date = new Date().toISOString().slice(0, 10);
  const filename = `${handle}-thread-${date}.md`;
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Listen for messages from content script
browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'XTR_PROGRESS') {
    render({ status: 'loading', message: msg.message as string, count: msg.count as number | undefined });
  } else if (msg.type === 'XTR_DONE') {
    render({ status: 'done', markdown: msg.markdown as string, count: msg.count as number });
  } else if (msg.type === 'XTR_ERROR') {
    render({ status: 'error', message: msg.error as string });
  }
});

// Init
async function init() {
  render({ status: 'detecting' });

  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];

  if (!tab?.id || !tab.url?.match(/x\.com|twitter\.com/)) {
    render({ status: 'not-x' });
    return;
  }

  tabId = tab.id;

  try {
    const res = await browser.tabs.sendMessage(tab.id, { type: 'CHECK_PAGE' });
    render(res?.isThreadPage ? { status: 'ready' } : { status: 'not-thread' });
  } catch {
    render({ status: 'not-x' });
  }
}

init();

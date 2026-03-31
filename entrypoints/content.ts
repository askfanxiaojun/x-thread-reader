import { extractThread } from '../lib/extractor';
import { formatThreadToMarkdown } from '../lib/formatter';
import { showToast } from '../lib/ui';

export default defineContentScript({
  matches: ['*://x.com/*', '*://twitter.com/*'],
  runAt: 'document_idle',

  main() {
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'CHECK_PAGE') {
        sendResponse({ isThreadPage: /\/status\/\d+/.test(location.pathname) });
        return;
      }

      if (message.type === 'EXTRACT_THREAD') {
        sendResponse({ ok: true });

        extractThread((msg, count) => {
          browser.runtime.sendMessage({ type: 'XTR_PROGRESS', message: msg, count }).catch(() => {});
        })
          .then((tweets) => {
            if (tweets.length === 0) {
              browser.runtime.sendMessage({ type: 'XTR_ERROR', error: browser.i18n.getMessage('errNoTweets') }).catch(() => {});
              return;
            }
            if (tweets.length === 1) {
              browser.runtime.sendMessage({ type: 'XTR_ERROR', error: browser.i18n.getMessage('errNotThread') }).catch(() => {});
              return;
            }
            const markdown = formatThreadToMarkdown(tweets);
            browser.runtime.sendMessage({ type: 'XTR_DONE', markdown, count: tweets.length }).catch(() => {});
          })
          .catch((err) => {
            const error = err instanceof Error ? err.message : '提取失败';
            showToast(`错误: ${error}`, true);
            browser.runtime.sendMessage({ type: 'XTR_ERROR', error }).catch(() => {});
          });
      }
    });
  },
});

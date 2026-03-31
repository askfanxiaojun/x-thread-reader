import { SELECTORS } from './dom-selectors';

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function waitForElement(
  selector: string,
  timeout = 5000,
): Promise<Element | null> {
  return new Promise((resolve) => {
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

export async function scrollToTop(): Promise<void> {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  await sleep(800);
  await waitForElement(SELECTORS.tweet, 5000);
  await sleep(300);
}

export async function scrollDown(): Promise<void> {
  window.scrollBy({ top: window.innerHeight * 0.7, behavior: 'smooth' });
  await sleep(600 + Math.random() * 400);
}

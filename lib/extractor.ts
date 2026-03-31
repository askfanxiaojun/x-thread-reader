import { SELECTORS } from './dom-selectors';
import { sleep, scrollToTop, scrollDown } from './scroller';

export interface TweetData {
  id: string;
  author: string;
  handle: string;
  text: string;
  images: string[];
  timestamp: string;
}

export type ProgressCallback = (message: string, count?: number) => void;

export function getThreadAuthorHandle(): string | null {
  const match = window.location.pathname.match(/^\/([^/]+)\/status\//);
  return match ? `@${match[1]}` : null;
}

function getHandleFromTweet(article: Element): string | null {
  const nameEl = article.querySelector(SELECTORS.userName);
  if (!nameEl) return null;

  const links = nameEl.querySelectorAll('a[role="link"]');
  for (const link of links) {
    const href = link.getAttribute('href');
    if (href && /^\/[A-Za-z0-9_]+$/.test(href)) {
      return `@${href.slice(1)}`;
    }
  }

  const text = nameEl.textContent || '';
  const m = text.match(/@([A-Za-z0-9_]+)/);
  return m ? `@${m[1]}` : null;
}

function getDisplayName(article: Element): string {
  const nameEl = article.querySelector(SELECTORS.userName);
  if (!nameEl) return '';

  const link = nameEl.querySelector('a[role="link"]');
  if (!link) return '';

  const spans = link.querySelectorAll('span');
  for (const span of spans) {
    const t = span.textContent?.trim();
    if (t && !t.startsWith('@') && t.length > 0) return t;
  }

  return link.textContent?.trim() || '';
}

function getTweetId(article: Element): string | null {
  const timeEl = article.querySelector('time[datetime]');
  if (timeEl) {
    const anchor = timeEl.closest('a');
    if (anchor) {
      const m = anchor.getAttribute('href')?.match(/\/status\/(\d+)/);
      if (m) return m[1];
    }
  }

  const links = article.querySelectorAll('a[href*="/status/"]');
  for (const link of links) {
    const m = link.getAttribute('href')?.match(/\/status\/(\d+)/);
    if (m) return m[1];
  }

  return null;
}

function extractTextRecursive(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || '';
  }

  if (!(node instanceof HTMLElement)) return '';

  switch (node.tagName) {
    case 'BR':
      return '\n';
    case 'A': {
      const text = node.textContent || '';
      if (text.startsWith('@') || text.startsWith('#')) return text;
      return node.getAttribute('title') || text;
    }
    case 'IMG':
      return node.getAttribute('alt') || '';
    default: {
      let result = '';
      for (const child of node.childNodes) {
        result += extractTextRecursive(child);
      }
      return result;
    }
  }
}

function extractImages(article: Element): string[] {
  const images: string[] = [];
  const imgs = article.querySelectorAll(SELECTORS.tweetPhoto);
  for (const img of imgs) {
    let src = img.getAttribute('src') || '';
    if (!src || src.includes('emoji') || src.includes('hashflag')) continue;
    src = src.replace(/&name=\w+/, '&name=large');
    if (!src.includes('&name=')) src += '?name=large';
    images.push(src);
  }
  return images;
}

export function extractSingleTweet(article: Element): TweetData | null {
  const id = getTweetId(article);
  if (!id) return null;

  const handle = getHandleFromTweet(article);
  if (!handle) return null;

  const author = getDisplayName(article);
  const textEl = article.querySelector(SELECTORS.tweetText);
  const text = textEl ? extractTextRecursive(textEl).trim() : '';
  const images = extractImages(article);
  const timeEl = article.querySelector('time[datetime]');
  const timestamp = timeEl?.getAttribute('datetime') || '';

  return { id, author, handle, text, images, timestamp };
}

export async function extractThread(
  onProgress?: ProgressCallback,
): Promise<TweetData[]> {
  const authorHandle = getThreadAuthorHandle();
  if (!authorHandle) throw new Error(browser.i18n.getMessage('errNoAuthor'));

  onProgress?.(browser.i18n.getMessage('loadingThread'));

  const savedScrollY = window.scrollY;

  await scrollToTop();

  onProgress?.(browser.i18n.getMessage('extracting'));

  const collected = new Map<string, TweetData>();
  let stableRounds = 0;
  const MAX_STABLE = 3;
  const MAX_SCROLLS = 80;

  for (let i = 0; i < MAX_SCROLLS && stableRounds < MAX_STABLE; i++) {
    const prevSize = collected.size;

    const articles = document.querySelectorAll(SELECTORS.tweet);
    for (const article of articles) {
      const data = extractSingleTweet(article);
      if (!data) continue;
      if (
        data.handle.toLowerCase() === authorHandle.toLowerCase() &&
        !collected.has(data.id)
      ) {
        collected.set(data.id, data);
      }
    }

    onProgress?.(browser.i18n.getMessage('extracting'), collected.size);

    if (collected.size === prevSize) {
      stableRounds++;
    } else {
      stableRounds = 0;
    }

    await scrollDown();
  }

  window.scrollTo({ top: savedScrollY, behavior: 'smooth' });
  await sleep(300);

  const tweets = Array.from(collected.values()).sort((a, b) => {
    if (a.id.length !== b.id.length) return a.id.length - b.id.length;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  onProgress?.(browser.i18n.getMessage('extractDone', [String(tweets.length)]));

  return tweets;
}

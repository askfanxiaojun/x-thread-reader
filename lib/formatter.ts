import type { TweetData } from './extractor';

function formatDate(date: Date): string {
  const locale = browser.i18n.getUILanguage();
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatThreadToMarkdown(tweets: TweetData[]): string {
  if (tweets.length === 0) return '';

  const { author, handle, timestamp } = tweets[0];
  const total = tweets.length;

  const lines: string[] = [];

  lines.push(`# Thread by ${author} (${handle})`);
  lines.push('');

  if (timestamp) {
    lines.push(`> ${browser.i18n.getMessage('mdPublishedAt')}: ${formatDate(new Date(timestamp))}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  tweets.forEach((tweet, i) => {
    lines.push(`### ${i + 1}/${total}`);
    lines.push('');
    lines.push(tweet.text);
    lines.push('');

    for (const img of tweet.images) {
      lines.push(`![](${img})`);
      lines.push('');
    }

    if (i < total - 1) {
      lines.push('---');
      lines.push('');
    }
  });

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`*${browser.i18n.getMessage('mdExportedBy')} | ${formatDate(new Date())}*`);
  lines.push('');

  return lines.join('\n');
}

export const SELECTORS = {
  tweet: 'article[data-testid="tweet"]',
  tweetText: '[data-testid="tweetText"]',
  userName: '[data-testid="User-Name"]',
  tweetPhoto: '[data-testid="tweetPhoto"] img',
  tweetVideo: '[data-testid="videoPlayer"]',
  timestamp: 'time[datetime]',
  primaryColumn: '[data-testid="primaryColumn"]',
} as const;

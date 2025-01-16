import { TransformedFeed } from '../types';
import { getRelativeDate } from './date';

/**
 * Escapes HTML special characters in a string.
 * @param input - The input string to sanitize.
 * @returns A sanitized string safe for embedding in HTML.
 */
function escapeHTML(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validates a URL and ensures it uses a safe protocol.
 * @param url - The URL to validate.
 * @param fallback - Fallback if invalid (default '#').
 */
function validateUrl(url: string, fallback = '#'): string {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      return url;
    }
  } catch {
    console.warn(`validateUrl: Invalid URL provided - ${url}`);
  }
  return fallback;
}

/**
 * Create the feed header element for a feed item.
 */
function createFeedHeader(
  feedTitle: string,
  feedUrl: string,
  feedIconUrl?: string
): HTMLDivElement {
  const feedHeader = document.createElement('div');
  feedHeader.className = 'blogroller-feed-header';

  const feedLink = document.createElement('a');
  feedLink.href = feedUrl || '#';
  feedLink.target = '_blank';
  feedLink.className = 'blogroller-feed-title-link';

  if (feedIconUrl) {
    const feedIcon = document.createElement('img');
    feedIcon.src = feedIconUrl || '';
    feedIcon.alt = `${feedTitle} icon`;
    feedIcon.className = 'blogroller-feed-icon';
    feedIcon.loading = 'lazy';
    feedIcon.setAttribute('referrerpolicy', 'no-referrer');

    feedLink.appendChild(feedIcon);
  }

  feedLink.appendChild(document.createTextNode(feedTitle));
  feedHeader.appendChild(feedLink);

  return feedHeader;
}

/**
 * Creates a clickable post link element.
 */
function createPostLink(postTitle: string, postUrl: string): HTMLAnchorElement {
  const postLink = document.createElement('a');
  postLink.href = postUrl || '#';
  postLink.target = '_blank';
  postLink.className = 'blogroller-post-title-link';
  postLink.innerHTML = postTitle;

  return postLink;
}

/**
 * Creates the "metadata" section showing reading time and relative date.
 */
function createFeedMeta(
  readingTime: string | null,
  relativeDate: string
): HTMLDivElement {
  const feedMeta = document.createElement('div');
  feedMeta.className = 'blogroller-feed-meta';

  const readingTimeSpan = document.createElement('span');
  readingTimeSpan.className = 'blogroller-reading-time';
  readingTimeSpan.textContent = readingTime || 'N/A';

  const separator = document.createElement('span');
  separator.className = 'blogroller-separator';
  separator.textContent = '•';

  const postDate = document.createElement('span');
  postDate.className = 'blogroller-post-date';
  postDate.textContent = relativeDate;

  feedMeta.appendChild(readingTimeSpan);
  feedMeta.appendChild(separator);
  feedMeta.appendChild(postDate);

  return feedMeta;
}

/**
 * Creates a single feed item element in the DOM, representing a feed's latest post.
 **/
export function createFeedItem(feed: TransformedFeed): HTMLDivElement {
  const feedTitle = escapeHTML(feed.feedTitle) || 'Untitled Feed';
  const postTitle = escapeHTML(feed.postTitle) || 'Untitled Post';
  const relativeDate = getRelativeDate(feed.pubDate);
  const feedUrl = validateUrl(feed.feedUrl);
  const postUrl = validateUrl(feed.postUrl);

  const feedItem = document.createElement('div');
  feedItem.className = 'blogroller-feed-item';

  const feedHeader = createFeedHeader(feedTitle, feedUrl, feed.feedIcon);
  const postLink = createPostLink(postTitle, postUrl);
  const feedMeta = createFeedMeta(feed.readingTime, relativeDate);

  feedItem.appendChild(feedHeader);
  feedItem.appendChild(postLink);
  feedItem.appendChild(feedMeta);

  return feedItem;
}

/**
 * Creates an initially hidden "Show More" link element for pagination.
 **/
export function createShowMoreLink(): HTMLAnchorElement {
  const showMoreLink = document.createElement('a');
  showMoreLink.id = 'blogroller-show-more';
  showMoreLink.href = '#';
  showMoreLink.textContent = 'Show More';
  showMoreLink.style.display = 'none'; // Initially hidden
  return showMoreLink;
}

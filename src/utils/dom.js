import { getRelativeDate } from './date.js';

/**
 * Escapes HTML special characters in a string.
 *
 * @param {string} input - The input string to sanitize.
 * @returns {string} - A sanitized string safe for embedding in HTML.
 */
function escapeHTML(input) {
  if (typeof input !== 'string') {
    console.warn(
      'escapeHTML: Non-string input received. Returning empty string.'
    );
    return '';
  }
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validates a URL and ensures it uses a safe protocol.
 *
 * @param {string} url - The URL to validate.
 * @param {string} [fallback="#"] - The fallback value for invalid URLs.
 * @returns {string} - The validated URL or a placeholder.
 */
function validateUrl(url, fallback = '#') {
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
 * Create the feed header element.
 *
 * @param {string} feedTitle - The title of the feed.
 * @param {string} feedUrl - The URL of the feed.
 * @param {string} feedIconUrl - The URL of the feed icon.
 * @returns {HTMLElement} - The feed header element.
 */
function createFeedHeader(feedTitle, feedUrl, feedIconUrl) {
  const feedHeader = document.createElement('div');
  feedHeader.className = 'blogroller-feed-header';

  const feedLink = document.createElement('a');
  feedLink.href = feedUrl || '#';
  feedLink.target = '_blank';
  feedLink.className = 'blogroller-feed-title-link';

  const feedIcon = document.createElement('img');
  feedIcon.src = feedIconUrl || '';
  feedIcon.alt = `${feedTitle} icon`;
  feedIcon.className = 'blogroller-feed-icon';
  feedIcon.setAttribute('referrerpolicy', 'no-referrer');

  feedLink.appendChild(feedIcon);
  feedLink.appendChild(document.createTextNode(feedTitle));
  feedHeader.appendChild(feedLink);

  return feedHeader;
}

/**
 * Create the post link element.
 *
 * @param {string} postTitle - The title of the post.
 * @param {string} postUrl - The URL of the post.
 * @returns {HTMLElement} - The post link element.
 */
function createPostLink(postTitle, postUrl) {
  const postLink = document.createElement('a');
  postLink.href = postUrl || '#';
  postLink.target = '_blank';
  postLink.className = 'blogroller-post-title-link';
  postLink.textContent = postTitle;

  return postLink;
}

/**
 * Create the feed meta element.
 *
 * @param {string} readingTime - The reading time of the post.
 * @param {string} relativeDate - The relative date of the post.
 * @returns {HTMLElement} - The feed meta element.
 */
function createFeedMeta(readingTime, relativeDate) {
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
 * Create a single feed item element.
 *
 * @param {Object} feed - Feed data object.
 * @returns {HTMLElement} - DOM element for the feed item.
 **/
export function createFeedItem(feed) {
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
 * Create a "Show More" link element.
 *
 * @returns {HTMLElement} - DOM element for the "Show More" link.
 **/
export function createShowMoreLink() {
  const showMoreLink = document.createElement('a');
  showMoreLink.id = 'blogroller-show-more';
  showMoreLink.href = '#';
  showMoreLink.textContent = 'Show More';
  showMoreLink.style.display = 'none'; // Initially hidden
  return showMoreLink;
}

import { escapeHTML, validateUrl } from './general-utils.js';
import { timeSince } from './time-utils.js';

/**
 * Sort feeds by publication date in descending order.
 *
 * @param {Array} feeds - Array of feed data objects.
 * @returns {Array} - Sorted feeds data.
 */
export function sortFeedsByDate(feeds) {
  return feeds
    .filter((feed) => {
      if (!(feed.pubDate instanceof Date) || isNaN(feed.pubDate)) {
        console.warn(`Invalid pubDate for feed: ${feed}`);
        return false;
      }
      return true;
    })
    .sort((a, b) => b.pubDate - a.pubDate);
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
  feedItem.className = 'feed-item';

  const feedHeader = createFeedHeader(feedTitle, feedUrl, feed.feedIcon);
  const postLink = createPostLink(postTitle, postUrl);
  const feedMeta = createFeedMeta(feed.readingTime, relativeDate);

  feedItem.appendChild(feedHeader);
  feedItem.appendChild(postLink);
  feedItem.appendChild(feedMeta);

  return feedItem;
}

/**
 * Get the relative date string.
 *
 * @param {string|Date} pubDate - Publication date.
 * @returns {string} - Relative date string.
 */
function getRelativeDate(pubDate) {
  if (pubDate) {
    const parsedDate = new Date(pubDate);
    if (!isNaN(parsedDate.getTime())) {
      return timeSince(parsedDate);
    }
  }
  return 'Unknown Date';
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
  feedHeader.className = 'feed-header';

  const feedLink = document.createElement('a');
  feedLink.href = feedUrl || '#';
  feedLink.target = '_blank';
  feedLink.className = 'feed-title-link';

  const feedIcon = document.createElement('img');
  feedIcon.src = feedIconUrl || '';
  feedIcon.alt = `${feedTitle} icon`;
  feedIcon.className = 'feed-icon';
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
  postLink.className = 'post-title-link';
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
  feedMeta.className = 'feed-meta';

  const readingTimeSpan = document.createElement('span');
  readingTimeSpan.className = 'reading-time';
  readingTimeSpan.textContent = readingTime || 'N/A';

  const separator = document.createElement('span');
  separator.className = 'separator';
  separator.textContent = '•';

  const postDate = document.createElement('span');
  postDate.className = 'post-date';
  postDate.textContent = relativeDate;

  feedMeta.appendChild(readingTimeSpan);
  feedMeta.appendChild(separator);
  feedMeta.appendChild(postDate);

  return feedMeta;
}

/**
 * Create a "Show More" link element.
 *
 * @returns {HTMLElement} - DOM element for the "Show More" link.
 **/
export function createShowMoreLink() {
  const showMoreLink = document.createElement('a');
  showMoreLink.id = 'show-more';
  showMoreLink.href = '#';
  showMoreLink.textContent = 'Show More';
  showMoreLink.style.display = 'none'; // Initially hidden
  return showMoreLink;
}

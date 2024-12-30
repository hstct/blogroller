import { timeSince } from './time.js';

/**
 * Sort feeds by publication date in descending order.
 *
 * @param {Array} feeds - Array of feed data objects.
 * @returns {Array} - Sorted feeds data.
 */
export function sortFeedsByDate(feeds) {
    return feeds
        .filter(feed => feed.pubDate instanceof Date && !isNaN(feed.pubDate))
        .sort((a, b) => b.pubDate - a.pubDate);
}


/**
 * Create a single feed item element.
 *
 * @param {Object} feed - Feed data object.
 * @returns {HTMLElement} - DOM element for the feed item.
 **/
export function createFeedItem(feed) {
    const relativeDate = timeSince(feed.pubDate);
    const feedTitle = sanitize(feed.feedTitle) || 'Untitled Feed';
    const postTitle = sanitize(feed.postTitle) || 'Untitled Post';
    const feedItem = document.createElement('div');
    feedItem.className = 'feed-item';
    feedItem.innerHTML = `
        <div class="feed-header">
            <a href="${feed.feedUrl}" target="_blank" class="feed-title-link">
                <img src="${feed.feedIcon}" alt="${feedTitle} icon" class="feed-icon" referrerpolicy="no-referrer" />
                ${feedTitle}
            </a>
        </div>
        <a href="${feed.postUrl}" target="_blank" class="post-title-link">${postTitle}</a>
        <div class="feed-meta">
            <span class="reading-time">${feed.readingTime}</span>
            <span class="separator">•</span>
            <span class="post-date">${relativeDate}</span>
        </div>
    `;
    return feedItem;
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

/**
 * Sanitizes input by escaping HTML special characters.
 *
 * @param {string} input - The input string to sanitize.
 * @returns {string} - A sanitized string safe for embedding in HTML.
 */
function sanitize(input) {
    if (typeof input !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

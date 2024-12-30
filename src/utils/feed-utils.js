import { escapeHTML, validateUrl } from "./general-utils.js";
import { timeSince } from './time-utils.js';

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
    const feedTitle = escapeHTML(feed.feedTitle) || 'Untitled Feed';
    const postTitle = escapeHTML(feed.postTitle) || 'Untitled Post';

    let relativeDate = 'Unknown Date';
    if (feed.pubDate) {
        const parsedDate = new Date(feed.pubDate);
        if (!isNaN(parsedDate.getTime())) {
            relativeDate = timeSince(parsedDate);
        }
    }

    const feedUrl = validateUrl(feed.feedUrl);
    const postUrl = validateUrl(feed.postUrl);

    const feedItem = document.createElement('div');
    feedItem.className = 'feed-item';

    const feedHeader = document.createElement('div');
    feedHeader.className = 'fead-header';

    const feedLink = document.createElement('a');
    feedLink.href = feedUrl || '#';
    feedLink.target = '_blank';
    feedLink.className = 'feed-title-link';

    const feedIcon = document.createElement('img');
    feedIcon.src = feed.feedIcon || '';
    feedIcon.alt = `${feedTitle} icon`;
    feedIcon.className = 'feed-icon';
    feedIcon.setAttribute('referrerpolicy', 'no-referrer');

    feedLink.appendChild(feedIcon);
    feedLink.appendChild(document.createTextNode(feedTitle));
    feedHeader.appendChild(feedLink);

    const postLink = document.createElement('a');
    postLink.href = postUrl || '#';
    postLink.target = '_blank';
    postLink.className = 'post-title-link';
    postLink.textContent = postTitle;

    const feedMeta = document.createElement('div');
    feedMeta.className = 'feed-meta';

    const readingTime = document.createElement('span');
    readingTime.className = 'reading-time';
    readingTime.textContent = feed.readingTime || 'N/A';

    const separator = document.createElement('span');
    separator.className = 'separator';
    separator.textContent = '•';

    const postDate = document.createElement('span');
    postDate.className = 'post-date';
    postDate.textContent = relativeDate;

    feedMeta.appendChild(readingTime);
    feedMeta.appendChild(separator);
    feedMeta.appendChild(postDate);

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
    showMoreLink.id = 'show-more';
    showMoreLink.href = '#';
    showMoreLink.textContent = 'Show More';
    showMoreLink.style.display = 'none'; // Initially hidden
    return showMoreLink;
}

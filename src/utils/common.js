/**
 * Estimates the average reading time of a text based on the word count.
 *
 * @param {string} content - The content to estimate reading time for (e.g., HTML or plain text).
 * @param {number} [wordsPerMinute=250] - The average reading speed in words per minute.
 * @returns {string} - A string representing the estimated reading time (e.g., "3 min read").
 */
export function calculateReadingTime(content, wordsPerMinute = 250) {
  if (typeof content !== 'string') {
    throw new Error(
      "Invalid content provided to 'calculateReadingTime'. Expected a string."
    );
  }
  if (typeof wordsPerMinute !== 'number' || wordsPerMinute <= 0) {
    throw new Error(
      "Invalid 'wordsPerMinute' value. Expected a positive number."
    );
  }

  // Remove HTML tags and count words
  const plainText = content
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&[^;]+;/g, ' ');
  const wordCount = plainText
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  if (wordCount === 0) {
    return '0 min read';
  }

  // Calculate and format reading time
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

/**
 * Helper function to construct a URL with optional query parameters.
 *
 * @param {string} baseUrl - The base URL.
 * @param {string} endpoint - The endpoint to append to the base URL.
 * @param {Object} [queryParams] - Optional query parameters as key-value pairs.
 * @returns {string} - The constructed URL.
 */
export function constructApiUrl(baseUrl, endpoint, queryParams = {}) {
  const url = new URL(endpoint, baseUrl);
  Object.keys(queryParams).forEach((key) =>
    url.searchParams.append(key, queryParams[key])
  );
  return url.toString();
}

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

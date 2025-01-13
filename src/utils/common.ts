import { SortableFeed } from '../types';

/**
 * Estimates the average reading time of a text based on the word count.
 * @param content - The text content (e.g., HTML or plain text).
 * @param wordsPerMinute - The average reading speed in words per minute (defaults to 250).
 * @returns A string representing the estimated reading time (e.g., "3 min read").
 */
export function calculateReadingTime(
  content: string,
  wordsPerMinute: number = 250
): string {
  if (wordsPerMinute <= 0) {
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
 * Sort feeds by publication date in descending order.
 * @param feeds - Array of feed data objects.
 * @returns The Sorted feeds, newest first.
 */
export function sortFeedsByDate<T extends SortableFeed>(feeds: T[]): T[] {
  const validFeeds = feeds.filter((feed) => {
    if (!feed.pubDate) return false;
    if (isNaN(feed.pubDate.getTime())) return false;
    return true;
  });
  validFeeds.sort((a, b) => b.pubDate!.getTime() - a.pubDate!.getTime());
  return validFeeds;
}

/**
 * Calulates the time elapsed since a given date and formats it as a human-readable string.
 *
 * @param {Date} date - The date to calculate the elapsed time from.
 * @returns {string} - A string representing the relative time (e.g., "2 days ago").
 */
export function timeSince(date) {
    if (!(date instanceof Date)) {
        throw new Error("Invalid date provided to 'timeSince'. Expected a Date object.");
    }

    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
        { label: 'second', seconds: 1 },
    ];
    
    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
        }
    }
    return 'just now';
}

/**
 * Estimates the average reading time of a text based on the word count.
 *
 * @param {string} content - The content to estimate reading time for (e.g., HTML or plain text).
 * @param {number} [wordsPerMinute=250] - The average reading speed in words per minute.
 * @returns {string} - A string representing the estimated reading time (e.g., "3 min read").
 */
export function calculateReadingTime(content, wordsPerMinute = 250) {
    if (typeof content !== 'string') {
        throw new Error("Invalid content provided to 'calculateReadingTime'. Expected a string.");
    }
    if (typeof wordsPerMinute !== 'number' || wordsPerMinute <= 0) {
        throw new Error("Invalid 'wordsPerMinute' value. Expected a positive number.");
    }

    // Remove HTML tags and count words
    const plainText = content.replace(/<\/?[^>]+(>|$)/g, "");
    const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;

    // Calculate and format reading time
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
}

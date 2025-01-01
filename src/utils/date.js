/**
 * Calulates the time elapsed since a given date and formats it as a human-readable string.
 *
 * @param {Date} date - The date to calculate the elapsed time from.
 * @param {Object} [labels] - Custom labels for intervals (e.g., { year: "año", second: "segundo" }).
 * @param {number} [threshold=5] - Number of seconds under which to return "just now".
 * @returns {string} - A string representing the relative time (e.g., "2 days ago").
 */
function timeSince(date, labels = {}, threshold = 5) {
  if (!(date instanceof Date)) {
    throw new Error(
      "Invalid date provided to 'timeSince'. Expected a Date object."
    );
  }

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 0) {
    return 'in the future';
  }

  if (seconds < threshold) {
    return 'just now';
  }

  const defaultLabels = {
    year: 'year',
    month: 'month',
    day: 'day',
    hour: 'hour',
    minute: 'minute',
    second: 'second',
  };

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];

  const finalLabels = { ...defaultLabels, ...labels };

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      const label = finalLabels[interval.label] || interval.label;
      return `${count} ${label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

/**
 * Get the relative date string.
 *
 * @param {string|Date} pubDate - Publication date.
 * @param {Object} [labels] - Custom labels for intervals (optional).
 * @param {number} [threshold=5] - Seconds threshold for returning "just now".
 * @returns {string} - Relative date string.
 */
export function getRelativeDate(pubDate, labels = {}, threshold = 5) {
  if (pubDate) {
    const parsedDate = new Date(pubDate);
    if (!isNaN(parsedDate.getTime())) {
      return timeSince(parsedDate, labels, threshold);
    }
  }
  return 'Unknown Date';
}

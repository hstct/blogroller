type TimeIntervalLabel =
  | 'year'
  | 'month'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second';

interface Interval {
  label: TimeIntervalLabel;
  seconds: number;
}

const defaultLabels: Record<TimeIntervalLabel, string> = {
  year: 'year',
  month: 'month',
  day: 'day',
  hour: 'hour',
  minute: 'minute',
  second: 'second',
};

const intervals: Interval[] = [
  { label: 'year', seconds: 31536000 },
  { label: 'month', seconds: 2592000 },
  { label: 'day', seconds: 86400 },
  { label: 'hour', seconds: 3600 },
  { label: 'minute', seconds: 60 },
  { label: 'second', seconds: 1 },
];

/**
 * Calulates the time elapsed since a given date and formats it as a human-readable string.
 * @param date - The Date to compare with now.
 * @param labels - Optional custom labels for intervals.
 * @param threshold - Number of seconds under which to return "just now".
 */
function timeSince(
  date: Date,
  labels: Partial<Record<TimeIntervalLabel, string>> = {},
  threshold: number = 5
): string {
  const mergedLabels: Record<TimeIntervalLabel, string> = {
    ...defaultLabels,
    ...labels,
  };

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 0) return 'in the future';
  if (seconds < threshold) return 'just now';

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      const label = mergedLabels[interval.label] || interval.label;
      return `${count} ${label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

/**
 * Returns a string like "2 days ago" or "just now", given a date.
 * @param pubDate - The publication date (Date, string, or null).
 * @param labels - Optional custom labels for intervals.
 * @param threshold - Number of seconds under which to return "just now".
 * @returns The formatted relative date, or "Unknown Date" if invalid.
 */
export function getRelativeDate(
  pubDate: string | Date | null | undefined,
  labels: Record<string, string> = {},
  threshold: number = 5
): string {
  if (!pubDate) return 'Unknown Date';

  const dateObj = pubDate instanceof Date ? pubDate : new Date(pubDate);

  if (isNaN(dateObj.getTime())) {
    return 'Unknown Date';
  }
  return timeSince(dateObj, labels, threshold);
}

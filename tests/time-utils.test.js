import { timeSince, calculateReadingTime } from '../src/utils/time-utils.js';

describe('timeSince', () => {
  test('should return "just now" for recent dates', () => {
    const now = new Date();
    expect(timeSince(now)).toBe('just now');
  });

  test('should return correct relative time for past dates', () => {
    const oneDayAgo = new Date(Date.now() - 86400000);
    expect(timeSince(oneDayAgo)).toBe('1 day ago');
  });

  test('should throw error for invalid dates', () => {
    expect(() => timeSince('invalid')).toThrow(
      "Invalid date provided to 'timeSince'. Expected a Date object."
    );
  });

  test('should return correct relative time for future dates', () => {
    const futureDate = new Date(Date.now() + 86400000);
    expect(timeSince(futureDate)).toBe('in the future');
  });

  test('should return correct relative time for different time units', () => {
    const oneMinuteAgo = new Date(Date.now() - 60000);
    expect(timeSince(oneMinuteAgo)).toBe('1 minute ago');

    const oneHourAgo = new Date(Date.now() - 3600000);
    expect(timeSince(oneHourAgo)).toBe('1 hour ago');

    const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
    expect(timeSince(oneWeekAgo)).toBe('7 days ago');

    const oneMonthAgo = new Date(Date.now() - 30 * 86400000);
    expect(timeSince(oneMonthAgo)).toBe('1 month ago');

    const oneYearAgo = new Date(Date.now() - 365 * 86400000);
    expect(timeSince(oneYearAgo)).toBe('1 year ago');
  });
});

describe('calculateReadingTime', () => {
  const content = 'This is a sample text for testing';

  test('should calculate reading time for plain text', () => {
    expect(calculateReadingTime(content)).toBe('1 min read');
  });

  test('should calculate reading time for HTML content', () => {
    const html = '<p>This is a test sentence with ten words.</p>';
    expect(calculateReadingTime(html)).toBe('1 min read');
  });

  test('should throw error for invalid input', () => {
    expect(() => calculateReadingTime(12345)).toThrow(
      "Invalid content provided to 'calculateReadingTime'. Expected a string."
    );
  });

  test('should throw an error for invalid wordsPerMinute value', () => {
    expect(() => calculateReadingTime(content, 'invalid')).toThrow(
      "Invalid 'wordsPerMinute' value. Expected a positive number."
    );

    expect(() => calculateReadingTime(content, -100)).toThrow(
      "Invalid 'wordsPerMinute' value. Expected a positive number."
    );

    expect(() => calculateReadingTime(content, 0)).toThrow(
      "Invalid 'wordsPerMinute' value. Expected a positive number."
    );
  });

  test('should calculate reading time for empty string', () => {
    expect(calculateReadingTime('')).toBe('0 min read');
  });

  test('should calculate reading time for very long content', () => {
    const longContent = 'word '.repeat(1000);
    expect(calculateReadingTime(longContent)).toBe('4 min read');
  });

  test('should calculate reading time for HTML with nested elements', () => {
    const nestedHtml =
      '<div><p>This is a test sentence with ten words.</p></div>';
    expect(calculateReadingTime(nestedHtml)).toBe('1 min read');
  });

  test('should calculate reading time with different wordsPerMinue values', () => {
    const longContent = 'word '.repeat(1000);
    expect(calculateReadingTime(longContent, 200)).toBe('5 min read');
    expect(calculateReadingTime(longContent, 300)).toBe('4 min read');
  });
});

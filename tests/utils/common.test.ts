import { SortableFeed } from '../../src/types';
import { calculateReadingTime, sortFeedsByDate } from '../../src/utils/common';

describe('calculateReadingTime', () => {
  const content = 'This is a sample text for testing';

  test('should calculate reading time for plain text', () => {
    expect(calculateReadingTime(content)).toBe('1 min read');
  });

  test('should calculate reading time for HTML content', () => {
    const html = '<p>This is a test sentence with ten words.</p>';
    expect(calculateReadingTime(html)).toBe('1 min read');
  });

  test('should throw an error for invalid wordsPerMinute value', () => {
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

describe('sortFeedsByDate', () => {
  test('should sort feeds in descending order by pubDate', () => {
    const feeds: SortableFeed[] = [
      { pubDate: new Date('2022-01-01') },
      { pubDate: new Date('2023-01-01') },
      { pubDate: new Date('2021-01-01') },
    ];

    const sorted = sortFeedsByDate(feeds);

    expect(sorted).toEqual([
      { pubDate: new Date('2023-01-01') },
      { pubDate: new Date('2022-01-01') },
      { pubDate: new Date('2021-01-01') },
    ]);
  });

  test('should ignore null or invalid dates', () => {
    const feeds: SortableFeed[] = [
      { pubDate: new Date('2022-01-01') },
      { pubDate: null },
      { pubDate: new Date('2021-01-01') },
      { pubDate: new Date(NaN) },
    ];

    const sorted = sortFeedsByDate(feeds);

    expect(sorted).toEqual([
      { pubDate: new Date('2022-01-01') },
      { pubDate: new Date('2021-01-01') },
    ]);
  });

  test('should handle feeds with same pubDate', () => {
    const feeds: SortableFeed[] = [
      { pubDate: new Date('2022-01-01') },
      { pubDate: new Date('2022-01-01') },
    ];

    const sorted = sortFeedsByDate(feeds);

    expect(sorted).toEqual([
      { pubDate: new Date('2022-01-01') },
      { pubDate: new Date('2022-01-01') },
    ]);
  });

  test('should handle empty feeds array', () => {
    const feeds: SortableFeed[] = [];
    const sorted = sortFeedsByDate(feeds);

    expect(sorted).toEqual([]);
  });

  test('should handle feeds with future dates', () => {
    const feeds: SortableFeed[] = [
      { pubDate: new Date('2045-01-01') },
      { pubDate: new Date('2023-01-01') },
    ];

    const sorted = sortFeedsByDate(feeds);

    expect(sorted).toEqual([
      { pubDate: new Date('2045-01-01') },
      { pubDate: new Date('2023-01-01') },
    ]);
  });
});

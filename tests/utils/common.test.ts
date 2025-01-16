import { calculateReadingTime } from '../../src/utils/common';

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

import { escapeHTML, validateUrl } from '../src/utils/general-utils.js';

describe('escapeHTML', () => {
  test('should escape HTML special characters', () => {
    expect(escapeHTML('<script>alert("XSS")</script>')).toBe(
      '&lt;script&gt;alert("XSS")&lt;/script&gt;'
    );
  });

  test('should return an empty string for non-string input', () => {
    expect(escapeHTML(123)).toBe('');
    expect(escapeHTML(null)).toBe('');
  });

  test('should return an empty string for empty string input', () => {
    expect(escapeHTML('')).toBe('');
  });

  test('should return the same string if no special characters', () => {
    expect(escapeHTML('hello world')).toBe('hello world');
  });

  test('should escape a mix of text and HTML special characters', () => {
    expect(escapeHTML('hello <b>world</b> & welcome')).toBe(
      'hello &lt;b&gt;world&lt;/b&gt; &amp; welcome'
    );
  });
});

describe('validateUrl', () => {
  test('should return the same URL if valid and safe', () => {
    expect(validateUrl('https://test.com/')).toBe('https://test.com/');
  });

  test('should return "#" for invalid URLs', () => {
    expect(validateUrl('invalid-url')).toBe('#');
  });

  test('should return "#" for unsafe protocols', () => {
    expect(validateUrl('javascript:alert("XSS")')).toBe('#');
  });

  test('should return the same URL for valid URL with query parameters', () => {
    expect(validateUrl('https://test.com/?q=search')).toBe(
      'https://test.com/?q=search'
    );
  });

  test('should return the same URL for valid URL with port, path, and fragment', () => {
    expect(validateUrl('https://test.com:8080/path#fragment')).toBe(
      'https://test.com:8080/path#fragment'
    );
  });

  test('should return "#" for empty string input', () => {
    expect(validateUrl('')).toBe('#');
  });

  test('should return "#" for null input', () => {
    expect(validateUrl(null)).toBe('#');
  });
});

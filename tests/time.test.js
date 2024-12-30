import { timeSince, calculateReadingTime } from '../src/utils/time.js';

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
        expect(() => timeSince('invalid')).toThrow('Invalid date provided to \'timeSince\'. Expected a Date object.');
    });
});

describe('calculateReadingTime', () => {
    test('should calculate reading time for plain text', () => {
        const text = 'This is a test sentence with ten words.';
        expect(calculateReadingTime(text)).toBe('1 min read');
    });

    test('should calculate reading time for HTML content', () => {
        const html = '<p>This is a test sentence with ten words.</p>';
        expect(calculateReadingTime(html)).toBe('1 min read');
    });

    test('should throw error for invalid input', () => {
        expect(() => calculateReadingTime(12345)).toThrow('Invalid content provided to \'calculateReadingTime\'. Expected a string.');
    });
});

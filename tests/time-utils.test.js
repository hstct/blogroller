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
        expect(() => timeSince('invalid')).toThrow('Invalid date provided to \'timeSince\'. Expected a Date object.');
    });
});

describe('calculateReadingTime', () => {
    const content = "This is a sample text for testing";

    test('should calculate reading time for plain text', () => {
        expect(calculateReadingTime(content)).toBe('1 min read');
    });

    test('should calculate reading time for HTML content', () => {
        const html = '<p>This is a test sentence with ten words.</p>';
        expect(calculateReadingTime(html)).toBe('1 min read');
    });

    test('should throw error for invalid input', () => {
        expect(() => calculateReadingTime(12345)).toThrow('Invalid content provided to \'calculateReadingTime\'. Expected a string.');
    });

    test('should throw an error for invalid wordsPerMinute value', () => {
        expect(() => calculateReadingTime(content, "invalid")).toThrow(
            "Invalid 'wordsPerMinute' value. Expected a positive number."
        );

        expect(() => calculateReadingTime(content, -100)).toThrow(
            "Invalid 'wordsPerMinute' value. Expected a positive number."
        );

        expect(() => calculateReadingTime(content, 0)).toThrow(
            "Invalid 'wordsPerMinute' value. Expected a positive number."
        );
    });
});

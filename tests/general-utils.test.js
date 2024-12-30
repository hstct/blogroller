import { escapeHTML, validateUrl } from "../src/utils/general-utils.js";

describe('escapeHTML', () => {
    test('should escape HTML special characters', () => {
        expect(escapeHTML('<script>alert("XSS")</script>')).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;');
    });

    test('should return an empty string for non-string input', () => {
        expect(escapeHTML(123)).toBe('');
        expect(escapeHTML(null)).toBe('');
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
});

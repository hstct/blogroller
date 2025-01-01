import { getRelativeDate } from '../../src/utils/date.js';

describe('date.js', () => {
  describe('getRelativeDate', () => {
    test('should return "just now" for every recent past dates', () => {
      const oneSecondAgo = new Date(Date.now() - 1000);
      expect(getRelativeDate(oneSecondAgo)).toBe('just now');
    });

    test('should handle a date a few minutes in the past', () => {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const result = getRelativeDate(twoMinutesAgo);

      expect(result).toMatch(/minute/);
      expect(result).toMatch(/ago/);
    });

    test('should handle a date a few hours in the past', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000);
      const result = getRelativeDate(threeHoursAgo);

      expect(result).toMatch(/3 hours ago/);
    });

    test('should handle a date a few days in the past', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 86400 * 1000);
      const result = getRelativeDate(twoDaysAgo);

      expect(result).toBe('2 days ago');
    });

    test('should handle a date a few months in the past', () => {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const result = getRelativeDate(twoMonthsAgo);

      expect(result).toMatch(/2 months ago/);
    });

    test('should handle a date a few years in the past', () => {
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
      const result = getRelativeDate(threeYearsAgo);

      expect(result).toMatch(/3 years ago/);
    });

    test('should return "in the future" for future dates', () => {
      const futureDate = new Date(Date.now() + 60_000);

      expect(getRelativeDate(futureDate)).toBe('in the future');
    });

    test('should return "Unknown Date" for invalid date strings', () => {
      expect(getRelativeDate('invalid-date')).toBe('Unknown Date');
      expect(getRelativeDate(null)).toBe('Unknown Date');
      expect(getRelativeDate(undefined)).toBe('Unknown Date');
      expect(getRelativeDate('')).toBe('Unknown Date');
    });

    test('should handle a valid date string', () => {
      const dateString = new Date(Date.now() - 3600_000).toISOString();
      const result = getRelativeDate(dateString);

      expect(result).toMatch(/1 hour ago/);
    });
  });

  describe('timeSince (custom labels)', () => {
    test('should allow custom labels', () => {
      const oneDayAgo = new Date(Date.now() - 86400_000);
      const labels = { day: 'jour' };
      const result = getRelativeDate(oneDayAgo, labels);

      expect(result).toBe('1 jour ago');
    });
  });
});

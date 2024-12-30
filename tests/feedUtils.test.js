import { sortFeedsByDate } from '../src/utils/feedUtils.js';

describe('sortFeedsByDate', () => {
    test('should sort feeds in descending order by pubDate', () => {
        const feeds = [
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
        const feeds = [
            { pubDate: new Date('2022-01-01') },
            { pubDate: null },
            { pubDate: new Date('2021-01-01') },
            { pubDate: 'invalid-date' },
        ];

        const sorted = sortFeedsByDate(feeds);

        expect(sorted).toEqual([
            { pubDate: new Date('2022-01-01') },
            { pubDate: new Date('2021-01-01') },
        ]);
    });
});

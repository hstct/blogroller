import { sortFeedsByDate, createFeedItem } from '../src/utils/feed-utils.js';

describe('createFeedItem', () => {
    test('should create a valid DOM element for a feed item', () => {
        const mockData = {
            feedTitle: 'Test Feed Item',
            postTitle: 'Sample Post',
            feedUrl: 'https://test.com',
            postUrl: 'https://test.com/post',
            pubData: new Date('2024-01-01').toISOString(),
            feedIcon: 'https://test.com/icon.png',
            readingTime: '5 min read',
        };

        const feedItem = createFeedItem(mockData);

        // Check that the returned element is a DOM node
        expect(feedItem).toBeInstanceOf(HTMLElement);

        // Validate structure
        const titleElement = feedItem.querySelector('.feed-title-link');
        const linkElement = feedItem.querySelector('.post-title-link');

        expect(titleElement).not.toBeNull();
        expect(titleElement.textContent.trim()).toBe(mockData.feedTitle);
        expect(linkElement.href).toBe(mockData.postUrl);
    });

    test('should sanitize potentially harmful scripts', () => {
        const mockData = {
            feedTitle: '<script>alert("XSS")</script>',
            postTitle: 'Sample Post',
            feedUrl: 'https://test.com',
            postUrl: 'javascript:alert("XSS")',
            pubData: new Date().toISOString(),
            feedIcon: 'https://test.com/icon.png',
        };

        const feedItem = createFeedItem(mockData);

        // Ensure the title is sanitized
        const titleElement = feedItem.querySelector('.feed-title-link');
        expect(titleElement.innerHTML).not.toContain('<script>');
        expect(titleElement.textContent).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;');

        // Ensure the link is sanitized or omitted
        const linkElement = feedItem.querySelector('.post-title-link');
        expect(linkElement.href).not.toContain('javascript');
    });

    test('should handle invalid or missing pubDate gracefully', () => {
        const mockData = {
            feedTitle: 'Test Feed',
            postTitle: 'Sample Post',
            feedUrl: 'https://test.com',
            postUrl: 'https://test.com/post',
            pubDate: 'invalid-date',
            feedIcon: 'https://test.com/icon.png',
            readingTime: '5 min read',
        };

        const feedItem = createFeedItem(mockData);

        expect(feedItem).toBeInstanceOf(HTMLElement);
        const metaElement = feedItem.querySelector('.post-date');
        expect(metaElement.textContent.trim()).toBe('Unknown Date');
    });

    test('should handle missing or invalid data gracefully', () => {
        const mockData = { feedTitle: '', postTitle: '', pubDate: '' };

        const feedItem = createFeedItem(mockData);

        // Check that it still creates a valid DOM element
        expect(feedItem).toBeInstanceOf(HTMLElement);

        // Ensure the content is default or empty
        const titleElement = feedItem.querySelector('.feed-title-link');
        const linkElement = feedItem.querySelector('.post-title-link');
        const postDateElement = feedItem.querySelector('.post-date');

        expect(titleElement.textContent).toBe('Untitled Feed');
        expect(linkElement.textContent).toBe('Untitled Post');
        expect(postDateElement.textContent).toBe('Unknown Date');
    });
});

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

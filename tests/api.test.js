import { fetchSubscriptions, fetchLatestPost, fetchFeedsData } from '../src/api/api.js';

global.fetch = jest.fn();

const mockResponses = {
    validSubscriptions: {
        subscriptions: [
            { categories: [{ label: 'favs' }], title: 'Feed 1' },
            { categories: [{ label: 'other' }], title: 'Feed 2' },
        ],
    },
    validPost: {
        items: [
            {
                title: 'Post Title',
                alternate: [{ href: 'https://post-url' }],
                published: 1672444800,
                summary: { content: 'This is a test summary.' },
            },
        ],
    },
    emptyPost: { items: [] },
};

const mockFetch = (response, ok = true, statusText = 'Error') => {
    fetch.mockResolvedValueOnce({
        ok,
        statusText,
        json: async () => response,
    });
};

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('API Tests', () => {
    describe('fetchSubscriptions', () => {
        test('should fetch and filter subscriptions by category', async () => {
            mockFetch(mockResponses.validSubscriptions);

            const result = await fetchSubscriptions({ subscriptionUrl: 'https://test-url' }, 'favs');
            expect(result).toEqual([{ categories: [{ label: 'favs' }], title: 'Feed 1' }]);
            expect(fetch).toHaveBeenCalledWith('https://test-url', {
                referrerPolicy: 'strict-origin-when-cross-origin',
            });
        });

        test('should throw an error for invalid subscriptionUrl', async () => {
            await expect(fetchSubscriptions({}, 'favs')).rejects.toThrow("Both 'subscriptionUrl' and 'categoryLabel' are required");
        });

        test('should handle API errors', async () => {
            mockFetch(null, false, 'Internal Server Error');

            await expect(fetchSubscriptions({ subscriptionUrl: 'https://test-url' }, 'favs')).rejects.toThrow(
                'Failed to fetch subscriptions: Internal Server Error'
            );
        });
    });

    describe('fetchLatestPost', () => {
        test('should fetch the latest post for a valid feed ID', async () => {
            mockFetch(mockResponses.validPost);

            const result = await fetchLatestPost('feed123', { feedBaseUrl: 'https://test-url/' });
            expect(result).toEqual({
                postTitle: 'Post Title',
                postUrl: 'https://post-url',
                pubDate: new Date(1672444800000),
                readingTime: '1 min read',
            });
            expect(fetch).toHaveBeenCalledWith('https://test-url/feed123?n=1', {
                referrerPolicy: 'strict-origin-when-cross-origin',
            });
        });

        test('should throw an error for invalid feedBaseUrl', async () => {
            await expect(fetchLatestPost('feed123', {})).rejects.toThrow("Both 'feedId' and 'feedBaseUrl' are required.");
        });

        test('should handle API errors', async () => {
            mockFetch(null, false, 'Not Found');

            await expect(fetchLatestPost('feed123', { feedBaseUrl: 'https://test-url/' })).rejects.toThrow(
                'Failed to fetch latest post for feed ID: feed123'
            );
        });
    });

    describe('fetchFeedsData', () => {
        const feeds = [
            { id: 'feed1', title: 'Feed 1', htmlUrl: 'https://feed1-url', iconUrl: 'https://icon1-url' },
            { id: 'feed2', title: 'Feed 2', htmlUrl: 'https://feed2-url', iconUrl: 'https://icon2-url' },
        ];

        test('should fetch data for valid feeds', async () => {
            mockFetch(mockResponses.validPost);
            mockFetch(mockResponses.validPost);

            const result = await fetchFeedsData(feeds, { feedBaseUrl: 'https://test-url/' });

            expect(result.feedsData).toHaveLength(2);
            expect(result.feedsData[0]).toEqual(expect.objectContaining({ feedTitle: 'Feed 1' }));
            expect(result.failedFeeds).toHaveLength(0);
        });

        test('should handle errors for some feeds', async () => {
            mockFetch(mockResponses.validPost);
            mockFetch(null, false, 'Not Found');

            const result = await fetchFeedsData(feeds, { feedBaseUrl: 'https://test-url/' });

            expect(result.feedsData).toHaveLength(1);
            expect(result.failedFeeds).toHaveLength(1);
            expect(result.failedFeeds[0]).toEqual(
                expect.objectContaining({
                    id: 'feed2',
                    title: 'Feed 2',
                    error: 'Failed to fetch latest post for feed ID: feed2',
                })
            );
        });
    });
});

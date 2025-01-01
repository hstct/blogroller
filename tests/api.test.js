import {
  fetchSubscriptions,
  fetchLatestPost,
  fetchFeedsData,
} from '../src/api.js';

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

      const result = await fetchSubscriptions(
        { subscriptionUrl: 'https://test-url' },
        'favs'
      );
      expect(result).toEqual([
        { categories: [{ label: 'favs' }], title: 'Feed 1' },
      ]);
      expect(fetch).toHaveBeenCalledWith('https://test-url', {
        referrerPolicy: 'strict-origin-when-cross-origin',
      });
    });

    test('should throw an error for invalid subscriptionUrl', async () => {
      await expect(fetchSubscriptions({}, 'favs')).rejects.toThrow(
        '[Blogroll] Missing required parameter(s) for fetchSubscriptions: subscriptionUrl'
      );
    });

    test('should handle API errors', async () => {
      mockFetch(null, false, 'Internal Server Error');

      await expect(
        fetchSubscriptions({ subscriptionUrl: 'https://test-url' }, 'favs')
      ).rejects.toThrow('Failed to fetch subscriptions: Internal Server Error');
    });

    test('should throw error for empty category label', async () => {
      await expect(
        fetchSubscriptions({ subscriptionUrl: 'https://test-url' }, '')
      ).rejects.toThrow(
        '[Blogroll] Missing required parameter(s) for fetchSubscriptions: categoryLabel'
      );
    });
  });

  describe('fetchLatestPost', () => {
    test('should fetch the latest post for a valid feed ID', async () => {
      mockFetch(mockResponses.validPost);

      const result = await fetchLatestPost('feed123', {
        feedBaseUrl: 'https://test-url/',
      });
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
      await expect(fetchLatestPost('feed123', {})).rejects.toThrow(
        '[Blogroll] Missing required parameter(s) for fetchLatestPost: feedBaseUrl'
      );
    });

    test('should handle API errors', async () => {
      mockFetch(null, false, 'Not Found');

      await expect(
        fetchLatestPost('feed123', { feedBaseUrl: 'https://test-url/' })
      ).rejects.toThrow('Failed to fetch latest post for feed ID: feed123');
    });

    test('should throw error for empty feed ID', async () => {
      await expect(
        fetchLatestPost('', { feedBaseUrl: 'https://test-url/' })
      ).rejects.toThrow(
        '[Blogroll] Missing required parameter(s) for fetchLatestPost: feedId'
      );
    });

    test('should handle feed with no posts', async () => {
      mockFetch(mockResponses.emptyPost);

      const result = await fetchLatestPost('feed123', {
        feedBaseUrl: 'https://test-url/',
      });
      expect(result).toBeNull();
    });

    test('should handle feed with invalid post data', async () => {
      mockFetch({ items: [{ invalid: 'data' }] });

      const result = await fetchLatestPost('feed123', {
        feedBaseUrl: 'https://test-url/',
      });
      expect(result).toBeNull();
    });
  });

  describe('fetchFeedsData', () => {
    const feeds = [
      {
        id: 'feed1',
        title: 'Feed 1',
        htmlUrl: 'https://feed1-url',
        iconUrl: 'https://icon1-url',
      },
      {
        id: 'feed2',
        title: 'Feed 2',
        htmlUrl: 'https://feed2-url',
        iconUrl: 'https://icon2-url',
      },
    ];

    test('should fetch data for valid feeds', async () => {
      mockFetch(mockResponses.validPost);
      mockFetch(mockResponses.validPost);

      const result = await fetchFeedsData(feeds, {
        feedBaseUrl: 'https://test-url/',
      });

      expect(result.feedsData).toHaveLength(2);
      expect(result.feedsData[0]).toEqual(
        expect.objectContaining({ feedTitle: 'Feed 1' })
      );
      expect(result.failedFeeds).toHaveLength(0);
    });

    test('should handle errors for some feeds', async () => {
      mockFetch(mockResponses.validPost);
      mockFetch(null, false, 'Not Found');

      const result = await fetchFeedsData(feeds, {
        feedBaseUrl: 'https://test-url/',
      });

      expect(result.feedsData).toHaveLength(1);
      expect(result.failedFeeds).toHaveLength(1);
      expect(result.failedFeeds[0]).toEqual(
        expect.objectContaining({
          id: 'feed2',
          title: 'Feed 2',
          error:
            '[Blogroll] Failed to fetch latest post for feed ID: feed2: Not Found',
        })
      );
    });
    test('should handle an empty feeds array', async () => {
      const result = await fetchFeedsData([], {
        feedBaseUrl: 'https://test-url/',
      });

      expect(result.feedsData).toHaveLength(0);
      expect(result.failedFeeds).toHaveLength(0);
    });

    test('should handle feeds with mixed valid and invalid content', async () => {
      mockFetch(mockResponses.validPost);
      mockFetch({ items: [{ invalid: 'data' }] });
      mockFetch(null, false, 'Not Found');

      const mixedFeeds = [
        ...feeds,
        {
          id: 'feed3',
          title: 'Feed 3',
          htmlUrl: 'https://feed3-url',
          iconUrl: 'https://icon3-url',
        },
      ];

      const result = await fetchFeedsData(mixedFeeds, {
        feedBaseUrl: 'https://test-url/',
      });

      expect(result.feedsData).toHaveLength(1);
      expect(result.failedFeeds).toHaveLength(2);

      expect(result.failedFeeds).toContainEqual(
        expect.objectContaining({
          id: 'feed2',
          title: 'Feed 2',
          error: 'No posts found',
        })
      );
      expect(result.failedFeeds).toContainEqual(
        expect.objectContaining({
          id: 'feed3',
          title: 'Feed 3',
          error:
            '[Blogroll] Failed to fetch latest post for feed ID: feed3: Not Found',
        })
      );
    });
  });
});

describe('Edge Cases', () => {
  test('fetchSubscriptions should handle no feeds', async () => {
    mockFetch({ subscriptions: [] }); // Empty subscription

    const result = await fetchSubscriptions(
      { subscriptionUrl: 'https://test-url' },
      'favs'
    );
    expect(result).toEqual([]);
  });

  test('fetchLatestPost should handle missing data gracefully', async () => {
    mockFetch({ items: [{}] }); // Missing expected fields

    const result = await fetchLatestPost('feed123', {
      feedBaseUrl: 'https://test-url/',
    });
    expect(result).toBeNull();
  });

  test('fetchFeedsData should handle a mix of valid and invalid feeds', async () => {
    mockFetch(mockResponses.validPost);
    mockFetch(mockResponses.emptyPost);
    mockFetch(null, false, 'Not Found');

    const feeds = [
      {
        id: 'feed1',
        title: 'Feed 1',
        htmlUrl: 'https://feed1-url',
        iconUrl: 'https://icon1-url',
      },
      {
        id: 'feed2',
        title: 'Feed 2',
        htmlUrl: 'https://feed2-url',
        iconUrl: 'https://icon2-url',
      },
      {
        id: 'feed3',
        title: 'Feed 3',
        htmlUrl: 'https://feed3-url',
        iconUrl: 'https://icon3-url',
      },
    ];

    const result = await fetchFeedsData(feeds, {
      feedBaseUrl: 'https://test-url/',
    });

    expect(result.feedsData).toHaveLength(1);
    expect(result.failedFeeds).toHaveLength(2);

    expect(result.failedFeeds).toContainEqual(
      expect.objectContaining({
        id: 'feed2',
        title: 'Feed 2',
        error: 'No posts found',
      })
    );
    expect(result.failedFeeds).toContainEqual(
      expect.objectContaining({
        id: 'feed3',
        title: 'Feed 3',
        error:
          '[Blogroll] Failed to fetch latest post for feed ID: feed3: Not Found',
      })
    );
  });
});

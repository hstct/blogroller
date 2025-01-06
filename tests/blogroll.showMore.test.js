import { Blogroll } from '../src/blogroll.js';

jest.mock('../src/api.js', () => {
  return {
    fetchSubscriptions: jest.fn(),
    fetchFeedsData: jest.fn(),
  };
});

import { fetchSubscriptions, fetchFeedsData } from '../src/api.js';
import { MESSAGES } from '../src/constants.js';

describe('Blogroll Show More Tests', () => {
  let container;
  let blogroll;

  beforeEach(() => {
    document.body.innerHTML = '<div id="rss-feed"></div>';
    container = document.getElementById('rss-feed');

    fetchSubscriptions.mockResolvedValueOnce([
      { id: 'feed1', title: 'Feed 1' },
      { id: 'feed2', title: 'Feed 2' },
      { id: 'feed3', title: 'Feed 3' },
    ]);

    fetchFeedsData.mockResolvedValueOnce({
      feedsData: [
        {
          feedTitle: 'Feed 1',
          feedUrl: 'https://feed1-url',
          feedIcon: 'https://icon1-url',
          postTitle: 'Post 1',
          postUrl: 'https://post1-url',
          pubDate: new Date(),
        },
        {
          feedTitle: 'Feed 2',
          feedUrl: 'https://feed2-url',
          feedIcon: 'https://icon2-url',
          postTitle: 'Post 2',
          postUrl: 'https://post2-url',
          pubDate: new Date(),
        },
        {
          feedTitle: 'Feed 3',
          feedUrl: 'https://feed3-url',
          feedIcon: 'https://icon3-url',
          postTitle: 'Post 3',
          postUrl: 'https://post3-url',
          pubDate: new Date(),
        },
      ],
      failedFeeds: [],
    });

    blogroll = new Blogroll();
    blogroll.initialize({
      proxyUrl: 'https://proxy.test.com/',
      categoryLabel: 'test',
      batchSize: 5,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  test('should NOT show "Show More" link if total feeds <= batchSize', async () => {
    await Promise.resolve();

    const showMoreLink = document.getElementById('blogroller-show-more');
    expect(showMoreLink).toBeNull();
  });

  test('should show "Show More" link if total feeds > batchSize, then load more feeds on click', async () => {
    blogroll.config.batchSize = 2;

    // Suppose we have 5 feeds from fetchSubscriptions
    fetchSubscriptions.mockResolvedValueOnce([
      { id: 'feed1', title: 'Feed 1' },
      { id: 'feed2', title: 'Feed 2' },
      { id: 'feed3', title: 'Feed 3' },
      { id: 'feed4', title: 'Feed 4' },
      { id: 'feed5', title: 'Feed 5' },
    ]);

    // feedsData: an array of 5 feed objects
    fetchFeedsData.mockResolvedValueOnce({
      feedsData: [
        {
          feedTitle: 'Feed 1',
          postTitle: 'Post 1',
          feedUrl: 'https://feed1-url',
          postUrl: 'https://feed1-post',
          pubDate: new Date(),
        },
        {
          feedTitle: 'Feed 2',
          postTitle: 'Post 2',
          feedUrl: 'https://feed2-url',
          postUrl: 'https://feed2-post',
          pubDate: new Date(),
        },
        {
          feedTitle: 'Feed 3',
          postTitle: 'Post 3',
          feedUrl: 'https://feed3-url',
          postUrl: 'https://feed3-post',
          pubDate: new Date(),
        },
        {
          feedTitle: 'Feed 4',
          postTitle: 'Post 4',
          feedUrl: 'https://feed4-url',
          postUrl: 'https://feed4-post',
          pubDate: new Date(),
        },
        {
          feedTitle: 'Feed 5',
          postTitle: 'Post 5',
          feedUrl: 'https://feed5-url',
          postUrl: 'https://feed5-post',
          pubDate: new Date(),
        },
      ],
      failedFeeds: [],
    });

    await blogroll.loadFeeds();

    // We should now have 2 items rendered (batchSize = 2)
    let feedItems = container.querySelectorAll('.blogroller-feed-item');
    expect(feedItems.length).toBe(2);

    // The "Show More" link should be visible
    const showMoreLink = document.getElementById('blogroller-show-more');
    expect(showMoreLink).not.toBeNull();
    expect(showMoreLink.style.display).toBe('block');

    // Simulate a click on "Show More"
    showMoreLink.click();

    // Now we expect 4 items (the next 2 in the list)
    feedItems = container.querySelectorAll('.blogroller-feed-item');
    expect(feedItems.length).toBe(4);

    // Click again → we should get the final 5th item
    showMoreLink.click();
    feedItems = container.querySelectorAll('.blogroller-feed-item');
    expect(feedItems.length).toBe(5);

    // After the last click, there are no more items left to show, so it should hide
    expect(showMoreLink.style.display).toBe('none');
  });

  test('should display error message if loadFeeds throws an error', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    fetchSubscriptions.mockRejectedValueOnce(new Error('Network fail'));

    await blogroll.loadFeeds();

    expect(container.innerHTML).toBe(MESSAGES.LOAD_FAILED);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      MESSAGES.ERROR.LOAD_FEEDS_FAILED,
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  test('should display MESSAGES.NO_POSTS if feedsData is empty', async () => {
    // Subscriptions are found but feed data is empty
    fetchSubscriptions.mockResolvedValueOnce([
      { id: 'feed1', title: 'Feed 1' },
    ]);
    fetchFeedsData.mockResolvedValueOnce({ feedsData: [], failedFeeds: [] });

    await blogroll.loadFeeds();

    expect(container.innerHTML).toBe(MESSAGES.NO_POSTS);
  });
});

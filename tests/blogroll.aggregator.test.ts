import { Blogroll } from '../src/blogroll';
import { fetchDigest } from '../src/api';
import { MESSAGES } from '../src/constants';

const mockFetchDigest = fetchDigest as jest.Mock;

jest.mock('../src/api', () => {
  return {
    fetchDigest: jest.fn(),
  };
});

describe('Blogroll Aggregator Tests', () => {
  let container: HTMLElement;
  let blogroll: Blogroll;

  beforeEach(() => {
    document.body.innerHTML = '<div id="rss-feed"></div>';
    container = document.getElementById('rss-feed')!;
    blogroll = new Blogroll();
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  test('should call aggregator on load and render returned feeds', async () => {
    mockFetchDigest.mockResolvedValueOnce({
      items: [
        {
          title: 'Post 100A',
          published: 1697000000,
          feedId: 'feed/100',
          feedTitle: 'Feed 100',
          feedHtmlUrl: 'https://feed100.example.com',
          feedIconUrl: 'https://feed100.example.com/icon.png',
          alternate: [{ href: 'https://feed100.example.com/postA' }],
        },
        {
          title: 'Post 200A',
          published: 1697100000,
          feedId: 'feed/200',
          feedTitle: 'Feed 200',
          feedHtmlUrl: 'https://feed200.example.com',
          feedIconUrl: 'https://feed200.example.com/icon.png',
          alternate: [{ href: 'https://feed200.example.com/postA' }],
        },
      ],
      page: 1,
      limit: 5,
      totalItems: 2,
    });

    blogroll.initialize({
      proxyUrl: 'https://proxy.test.com/',
      categoryLabel: 'test',
      batchSize: 5,
    });

    await Promise.resolve();

    expect(fetchDigest).toHaveBeenCalledTimes(1);

    const feedItems = container.querySelectorAll('.blogroller-feed-item');
    expect(feedItems.length).toBe(2);

    const feedTitles = Array.from(feedItems).map((item) => {
      const header = item.querySelector('.blogroller-feed-header');
      return header!.textContent;
    });

    expect(feedTitles).toEqual(
      expect.arrayContaining(['Feed 100', 'Feed 200'])
    );
  });

  test('should display NO_POSTS message if aggregator returns no feeds', async () => {
    mockFetchDigest.mockResolvedValueOnce({
      items: [],
      page: 1,
      limit: 5,
      totalItems: 0,
    });

    blogroll.initialize({
      proxyUrl: 'https://proxy.test.com/',
      categoryLabel: 'empty',
      batchSize: 5,
    });

    await Promise.resolve();

    expect(fetchDigest).toHaveBeenCalledTimes(1);
    expect(container.innerHTML).toBe(MESSAGES.NO_POSTS);
  });

  test('should handle pagination with Show More link', async () => {
    mockFetchDigest.mockResolvedValueOnce({
      items: [
        {
          title: 'Post 300A',
          published: 1697000000,
          feedId: 'feed/300',
          feedTitle: 'Feed 300',
          feedHtmlUrl: 'https://feed300.example.com',
          alternate: [{ href: 'https://feed300.example.com/postA' }],
        },
      ],
      page: 1,
      limit: 1,
      totalItems: 2,
    });

    mockFetchDigest.mockResolvedValueOnce({
      items: [
        {
          title: 'Post 400A',
          published: 1697100000,
          feedId: 'feed/400',
          feedTitle: 'Feed 400',
          feedHtmlUrl: 'https://feed400.example.com',
          alternate: [{ href: 'https://feed400.example.com/postA' }],
        },
      ],
      page: 2,
      limit: 1,
      totalItems: 2,
    });

    blogroll.initialize({
      proxyUrl: 'https://proxy.test.com/',
      categoryLabel: 'favs',
      batchSize: 1,
    });

    await Promise.resolve();
    let feedItems = container.querySelectorAll('.blogroller-feed-item');
    expect(feedItems.length).toBe(1);

    let showMoreLink = document.getElementById('blogroller-show-more');
    expect(showMoreLink).not.toBeNull();
    expect(showMoreLink!.style.display).toBe('block');

    showMoreLink!.click();
    await Promise.resolve();

    expect(fetchDigest).toHaveBeenCalledTimes(2);

    // container should now show 2 feed items total
    feedItems = container.querySelectorAll('.blogroller-feed-item');
    expect(feedItems.length).toBe(2);

    // The second feed item
    const feedHeader2 = feedItems[1].querySelector('.blogroller-feed-header');
    expect(feedHeader2!.textContent).toContain('Feed 400');

    // After second page, totalFeeds=2 -> we have 2 feeds rendered,
    // so "Show More" should now be hidden
    showMoreLink = document.getElementById('blogroller-show-more');
    expect(showMoreLink!.style.display).toBe('none');
  });
});

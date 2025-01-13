import { TransformedFeed } from '../../src/types';
import { createFeedItem } from '../../src/utils/dom';

describe('createFeedItem', () => {
  test('should create a valid DOM element for a feed item', () => {
    const mockData: TransformedFeed = {
      feedTitle: 'Test Feed Item',
      postTitle: 'Sample Post',
      feedUrl: 'https://test.com',
      postUrl: 'https://test.com/post',
      pubDate: new Date('2024-01-01'),
      feedIcon: 'https://test.com/icon.png',
      readingTime: '5 min read',
    };

    const feedItem = createFeedItem(mockData);
    expect(feedItem).toBeInstanceOf(HTMLElement);

    const titleElement = feedItem.querySelector('.blogroller-feed-title-link');
    expect(titleElement).not.toBeNull();
    expect(titleElement!.textContent!.trim()).toBe(mockData.feedTitle);

    const linkElement = feedItem.querySelector('.blogroller-post-title-link');
    expect(linkElement).not.toBeNull();
    expect(linkElement!.getAttribute('href')).toBe(mockData.postUrl);
  });

  test('should sanitize potentially harmful scripts', () => {
    const mockData: TransformedFeed = {
      feedTitle: '<script>alert("XSS")</script>',
      postTitle: 'Sample Post',
      feedUrl: 'https://test.com',
      postUrl: 'javascript:alert("XSS")',
      pubDate: new Date(),
      feedIcon: 'https://test.com/icon.png',
      readingTime: null,
    };

    const feedItem = createFeedItem(mockData);

    // Ensure the title is sanitized
    const titleElement = feedItem.querySelector('.blogroller-feed-title-link');
    expect(titleElement).not.toBeNull();
    expect(titleElement!.innerHTML).not.toContain('<script>');
    expect(titleElement!.textContent).toBe(
      '&lt;script&gt;alert("XSS")&lt;/script&gt;'
    );

    // Ensure the link is sanitized or omitted
    const linkElement = feedItem.querySelector<HTMLAnchorElement>(
      '.blogroller-post-title-link'
    );
    expect(linkElement).not.toBeNull();
    expect(linkElement!.href).not.toContain('javascript');
  });

  test('should handle invalid or missing pubDate gracefully', () => {
    const mockData: TransformedFeed = {
      feedTitle: 'Test Feed',
      postTitle: 'Sample Post',
      feedUrl: 'https://test.com',
      postUrl: 'https://test.com/post',
      pubDate: null,
      feedIcon: 'https://test.com/icon.png',
      readingTime: '5 min read',
    };

    const feedItem = createFeedItem(mockData);

    expect(feedItem).toBeInstanceOf(HTMLElement);
    const metaElement = feedItem.querySelector('.blogroller-post-date');
    expect(metaElement).not.toBeNull();
    expect(metaElement!.textContent!.trim()).toBe('Unknown Date');
  });

  test('should handle missing or invalid data gracefully', () => {
    const mockData: TransformedFeed = {
      feedTitle: '',
      postTitle: '',
      pubDate: null,
      feedUrl: '',
      postUrl: '',
      readingTime: null,
    };

    const feedItem = createFeedItem(mockData);

    // Check that it still creates a valid DOM element
    expect(feedItem).toBeInstanceOf(HTMLElement);

    // Ensure the content is default or empty
    const titleElement = feedItem.querySelector('.blogroller-feed-title-link');
    expect(titleElement).not.toBeNull();
    expect(titleElement!.textContent).toBe('Untitled Feed');

    const linkElement = feedItem.querySelector('.blogroller-post-title-link');
    expect(linkElement).not.toBeNull();
    expect(linkElement!.textContent).toBe('Untitled Post');

    const postDateElement = feedItem.querySelector('.blogroller-post-date');
    expect(postDateElement).not.toBeNull();
    expect(postDateElement!.textContent).toBe('Unknown Date');
  });

  test('should handle feed item without feedIcon', () => {
    const mockData: TransformedFeed = {
      feedTitle: 'Test Feed Item',
      postTitle: 'Sample Post',
      feedUrl: 'https://test.com',
      postUrl: 'https://test.com/post',
      pubDate: new Date('2024-01-01'),
      readingTime: '5 min read',
    };

    const feedItem = createFeedItem(mockData);

    expect(feedItem).toBeInstanceOf(HTMLElement);
    const iconElement = feedItem.querySelector('img.blogroller-feed-icon');
    expect(iconElement).toBeNull();
  });

  test('should handle special characters in postTitle', () => {
    const mockData: TransformedFeed = {
      feedTitle: 'Test Feed Item',
      postTitle: 'Sample <b>Post</b>',
      feedUrl: 'https://test.com',
      postUrl: 'https://test.com/post',
      pubDate: new Date('2024-01-01'),
      feedIcon: 'https://test.com/icon.png',
      readingTime: '5 min read',
    };

    const feedItem = createFeedItem(mockData);

    const linkElement = feedItem.querySelector('.blogroller-post-title-link');
    expect(linkElement).not.toBeNull();
    expect(linkElement!.innerHTML).toBe('Sample &lt;b&gt;Post&lt;/b&gt;');
  });

  test('should handle feed item with no readingTime', () => {
    const mockData: TransformedFeed = {
      feedTitle: 'Test Feed Item',
      postTitle: 'Sample Post',
      feedUrl: 'https://test.com',
      postUrl: 'https://test.com/post',
      pubDate: new Date('2024-01-01'),
      feedIcon: 'https://test.com/icon.png',
      readingTime: null,
    };

    const feedItem = createFeedItem(mockData);

    const readingTimeElement = feedItem.querySelector(
      '.blogroller-reading-time'
    );
    expect(readingTimeElement).not.toBeNull();
    expect(readingTimeElement!.textContent!.trim()).toBe('N/A');
  });

  test('should handle long feedTitle and postTitle', () => {
    const mockData: TransformedFeed = {
      feedTitle: 'A'.repeat(300),
      postTitle: 'B'.repeat(300),
      feedUrl: 'https://test.com',
      postUrl: 'https://test.com/post',
      pubDate: new Date('2024-01-01'),
      feedIcon: 'https://test.com/icon.png',
      readingTime: '5 min read',
    };

    const feedItem = createFeedItem(mockData);

    const titleElement = feedItem.querySelector('.blogroller-feed-title-link');
    expect(titleElement).not.toBeNull();
    expect(titleElement!.textContent!.length).toBe(300);

    const linkElement = feedItem.querySelector('.blogroller-post-title-link');
    expect(linkElement).not.toBeNull();
    expect(linkElement!.textContent!.length).toBe(300);
  });
});

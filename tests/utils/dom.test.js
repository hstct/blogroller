import { createFeedItem } from '../../src/utils/dom.js';

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
    const titleElement = feedItem.querySelector('.blogroller-feed-title-link');
    const linkElement = feedItem.querySelector('.blogroller-post-title-link');

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
    const titleElement = feedItem.querySelector('.blogroller-feed-title-link');
    expect(titleElement.innerHTML).not.toContain('<script>');
    expect(titleElement.textContent).toBe(
      '&lt;script&gt;alert("XSS")&lt;/script&gt;'
    );

    // Ensure the link is sanitized or omitted
    const linkElement = feedItem.querySelector('.blogroller-post-title-link');
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
    const metaElement = feedItem.querySelector('.blogroller-post-date');
    expect(metaElement.textContent.trim()).toBe('Unknown Date');
  });

  test('should handle missing or invalid data gracefully', () => {
    const mockData = { feedTitle: '', postTitle: '', pubDate: '' };

    const feedItem = createFeedItem(mockData);

    // Check that it still creates a valid DOM element
    expect(feedItem).toBeInstanceOf(HTMLElement);

    // Ensure the content is default or empty
    const titleElement = feedItem.querySelector('.blogroller-feed-title-link');
    const linkElement = feedItem.querySelector('.blogroller-post-title-link');
    const postDateElement = feedItem.querySelector('.blogroller-post-date');

    expect(titleElement.textContent).toBe('Untitled Feed');
    expect(linkElement.textContent).toBe('Untitled Post');
    expect(postDateElement.textContent).toBe('Unknown Date');
  });

  test.skip('should handle feed item without feedIcon', () => {
    const mockData = {
      feedTitle: 'Test Feed Item',
      postTitle: 'Sample Post',
      feedUrl: 'https://test.com',
      postUrl: 'https://test.com/post',
      pubDate: new Date('2024-01-01').toISOString(),
      readingTime: '5 min read',
    };

    const feedItem = createFeedItem(mockData);

    expect(feedItem).toBeInstanceOf(HTMLElement);
    const iconElement = feedItem.querySelector('img.blogroller-feed-icon');
    expect(iconElement).toBeNull();
  });

  test.skip('should handle special characters in postTitle', () => {
    const mockData = {
      feedTitle: 'Test Feed Item',
      postTitle: 'Sample <b>Post</b>',
      feedUrl: 'https://test.com',
      postUrl: 'https://test.com/post',
      pubDate: new Date('2024-01-01').toISOString(),
      feedIcon: 'https://test.com/icon.png',
      readingTime: '5 min read',
    };

    const feedItem = createFeedItem(mockData);

    const linkElement = feedItem.querySelector('.blogroller-post-title-link');
    expect(linkElement.innerHTML).toBe('Sample &lt;b&gt;Post&lt;/b&gt;');
  });

  test('should handle feed item with no readingTime', () => {
    const mockData = {
      feedTitle: 'Test Feed Item',
      postTitle: 'Sample Post',
      feedUrl: 'https://test.com',
      postUrl: 'https://test.com/post',
      pubDate: new Date('2024-01-01').toISOString(),
      feedIcon: 'https://test.com/icon.png',
    };

    const feedItem = createFeedItem(mockData);

    const readingTimeElement = feedItem.querySelector(
      '.blogroller-reading-time'
    );
    expect(readingTimeElement.textContent.trim()).toBe('N/A');
  });

  test('should handle long feedTitle and postTitle', () => {
    const mockData = {
      feedTitle: 'A'.repeat(300),
      postTitle: 'B'.repeat(300),
      feedUrl: 'https://test.com',
      postUrl: 'https://test.com/post',
      pubDate: new Date('2024-01-01').toISOString(),
      feedIcon: 'https://test.com/icon.png',
      readingTime: '5 min read',
    };

    const feedItem = createFeedItem(mockData);

    const titleElement = feedItem.querySelector('.blogroller-feed-title-link');
    const linkElement = feedItem.querySelector('.blogroller-post-title-link');

    expect(titleElement.textContent.length).toBe(300);
    expect(linkElement.textContent.length).toBe(300);
  });
});

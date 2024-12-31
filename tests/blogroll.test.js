import { Blogroll } from '../src/blogroll.js';

jest.mock('../src/config.js', () => ({
  CONFIG: {
    defaults: {
      documentClass: 'test-blogroll',
      subscriptionEndpoint: 'test/subscription',
      feedEndpoint: 'test/feed',
      batchSize: 5,
    },
    validation: {
      requiredParams: ['proxyUrl', 'categoryLabel'],
    },
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Blogroll Configuration Tests', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'rss-feed';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('should initialize with default config values', () => {
    const blogroll = new Blogroll();
    blogroll.initialize({
      proxyUrl: 'https://proxy.test.com',
      categoryLabel: 'Favorites',
    });

    expect(blogroll.config).toMatchObject({
      documentClass: 'test-blogroll',
      subscriptionEndpoint: 'test/subscription',
      feedEndpoint: 'test/feed',
      batchSize: 5,
      proxyUrl: 'https://proxy.test.com/',
      categoryLabel: 'Favorites',
    });
  });

  test('should throw error for missing required parameters', () => {
    const blogroll = new Blogroll();

    expect(() => blogroll.initialize({ categoryLabel: 'Favorites' })).toThrow(
      'Missing required parameter(s): proxyUrl'
    );

    expect(() =>
      blogroll.initialize({ proxyUrl: 'https://proxy.test.com' })
    ).toThrow('Missing required parameter(s): categoryLabel');
  });

  test.skip('should log an error for invalid container ID', () => {
    const blogroll = new Blogroll();
    const invalidContainerId = 'non-existent-id';

    expect(() => {
      blogroll.initialize({
        proxyUrl: 'https://proxy.test.com',
        categoryLabel: 'Favorites',
        containerId: invalidContainerId,
      });
    }).toThrow(
      new Error(
        `Feed container with ID '${invalidContainerId}' not found in the DOM.`
      )
    );
  });

  test('should merge custom configuration with defaults', () => {
    const blogroll = new Blogroll();
    blogroll.initialize({
      proxyUrl: 'https://proxy.test.com',
      categoryLabel: 'Favorites',
      batchSize: 10,
    });

    expect(blogroll.config.batchSize).toBe(10);
    expect(blogroll.config.documentClass).toBe('test-blogroll');
  });
});

describe('Blogroll Tests', () => {
  let blogroll;

  beforeEach(() => {
    document.body.innerHTML = '<div id="rss-feed"></div>';
    blogroll = new Blogroll();
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  test('should append a trailing slash to proxyUrl if missing', () => {
    blogroll.initialize({
      proxyUrl: 'https://proxy-url',
      categoryLabel: 'test',
    });

    expect(blogroll.config.proxyUrl).toBe('https://proxy-url/');
  });

  test('should throw error if feed container is missing', () => {
    const blogroll = new Blogroll();
    blogroll.initialize({
      proxyUrl: 'https://proxy-url/',
      categoryLabel: 'test',
    });
    document.body.innerHTML = '';
    expect(() => blogroll.getFeedContainer()).toThrow(
      "Feed container with ID 'rss-feed' not found in the DOM."
    );
  });
});

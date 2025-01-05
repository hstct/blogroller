import { Blogroll } from '../src/blogroll.js';

jest.mock('../src/config.js', () => ({
  CONFIG: {
    defaults: {
      documentClass: 'test-blogroll',
      subscriptionEndpoint: 'test/subscription',
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
      categoryLabel: 'test',
    });

    expect(blogroll.config).toMatchObject({
      documentClass: 'test-blogroll',
      subscriptionEndpoint: 'test/subscription',
      batchSize: 5,
      proxyUrl: 'https://proxy.test.com/',
      categoryLabel: 'test',
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
        categoryLabel: 'test',
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
      categoryLabel: 'test',
      batchSize: 10,
    });

    expect(blogroll.config.batchSize).toBe(10);
    expect(blogroll.config.documentClass).toBe('test-blogroll');
  });

  test('should handle invalid URL for proxyUrl', () => {
    const blogroll = new Blogroll();

    expect(() =>
      blogroll.initialize({
        proxyUrl: 'invalid-url',
        categoryLabel: 'test',
      })
    ).toThrow("Invalid 'proxyUrl'. Must be a valid URL string.");
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
      proxyUrl: 'https://proxy.test.com',
      categoryLabel: 'test',
    });

    expect(blogroll.config.proxyUrl).toBe('https://proxy.test.com/');
  });

  test('should throw error if feed container is missing', () => {
    blogroll.initialize({
      proxyUrl: 'https://proxy.test.com',
      categoryLabel: 'test',
    });
    document.body.innerHTML = '';
    expect(() => blogroll.getFeedContainer()).toThrow(
      "Feed container with ID 'rss-feed' not found in the DOM."
    );
  });

  test('should initialize multiple instances of Blogroll independently', () => {
    const blogroll1 = new Blogroll();
    const blogroll2 = new Blogroll();

    blogroll1.initialize({
      proxyUrl: 'https://proxy1.test.com',
      categoryLabel: 'Favorites',
    });
    blogroll2.initialize({
      proxyUrl: 'https://proxy2.test.com',
      categoryLabel: 'Work',
    });

    expect(blogroll1.config.proxyUrl).toBe('https://proxy1.test.com/');
    expect(blogroll2.config.proxyUrl).toBe('https://proxy2.test.com/');
  });

  test('should handle invalid or empty categoryLabel values', () => {
    expect(() =>
      blogroll.initialize({
        proxyUrl: 'https://proxy.test.com/',
        categoryLabel: '',
      })
    ).toThrow('Missing required parameter(s): categoryLabel');

    expect(() =>
      blogroll.initialize({
        proxyUrl: 'https://proxy.test.com/',
        categoryLabel: null,
      })
    ).toThrow('Missing required parameter(s): categoryLabel');
  });

  test('should initialize with a custom container ID', () => {
    document.body.innerHTML = '<div id="custom-container"></div>';
    blogroll.initialize({
      proxyUrl: 'https://proxy.test.com/',
      categoryLabel: 'test',
      containerId: 'custom-container',
    });

    const container = blogroll.getFeedContainer();
    expect(container.id).toBe('custom-container');
  });
});

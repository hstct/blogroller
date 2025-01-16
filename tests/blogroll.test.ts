import { Blogroll } from '../src/blogroll';

jest.mock('../src/config', () => ({
  CONFIG: {
    defaults: {
      documentClass: 'test-blogroll',
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
  let container: HTMLElement;
  let blogroll: Blogroll;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'rss-feed';
    document.body.appendChild(container);

    blogroll = new Blogroll();
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
      batchSize: 5,
      proxyUrl: 'https://proxy.test.com/',
      categoryLabel: 'test',
    });
  });

  test('should throw error for missing required parameters', () => {
    expect(() =>
      blogroll.initialize({ categoryLabel: 'Favorites' } as any)
    ).toThrow('Missing required parameter(s): proxyUrl');

    expect(() =>
      blogroll.initialize({ proxyUrl: 'https://proxy.test.com' } as any)
    ).toThrow('Missing required parameter(s): categoryLabel');
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
  let blogroll: Blogroll;

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
      } as any)
    ).toThrow('Missing required parameter(s): categoryLabel');
  });
});

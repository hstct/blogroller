import { Blogroll } from "../src/blogroll.js";

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
            proxyUrl: 'https://proxy-url',
            categoryLabel: 'favorites',
        });

        expect(blogroll.config.subscriptionUrl).toBe('https://proxy-url/test/subscription?output=json');
        expect(blogroll.config.feedBaseUrl).toBe('https://proxy-url/test/feed');
        expect(blogroll.config.batchSize).toBe(5);
    });

    test('should throw error for missing required parameters', () => {
        const blogroll = new Blogroll();

        expect(() => blogroll.initialize({ proxyUrl: 'https://proxy-url' }))
            .toThrow('Missing required parameter: categoryLabel');
    });
});

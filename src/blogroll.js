import { fetchSubscriptions, fetchFeedsData } from './api/api.js';
import { sortFeedsByDate, createFeedItem, createShowMoreLink } from './utils/feedUtils.js';

/**
 * Class to handle Blogroll functionality.
 */
export class Blogroll {
    constructor() {
        this.config = null;
        this.showMoreLink = null;
    }

    /**
     * Initialize the Blogroll with a configuration object.
     *
     * @param {Object} config - Configuration object.
     */
    initialize(config) {
        const defaults = {
            documentClass: 'blogroll',
            subscriptionEndpoint: 'subscription/list',
            feedEndpoint: 'stream/contents',
            batchSize: 10,
        }

        this.config = { ...defaults, ...config };

        // Validate required parameters
        const requiredParams = ['proxyUrl', 'categoryLabel'];
        for (const param of requiredParams) {
            if (!this.config[param]) {
                throw new Error(`Missing required parameter: ${param}`);
            }
        }

        // Construct derived URLs
        this.config.subscriptionUrl = `${this.config.proxyUrl}${this.config.subscriptionEndpoint}?output=json`;
        this.config.feedBaseUrl = `${this.config.proxyUrl}${this.config.feedEndpoint}`;

        this.loadFeeds();
    }

    /**
     * Validate the configuration object.
     *
     * @param {Object} config - Configuration object.
     */
    validateConfig(config) {
        const requireParams = ['proxyUrl', 'categoryLabel'];
        const missingParams = requireParams.filter(param => !config[param]);

        if (missingParams.length > 0) {
            throw new Error(`Missing required parameter(s): ${missingParams.join(', ')}`);
        }

        if (typeof config.proxyUrl !== 'string' || !config.proxyUrl.startsWith('http')) {
            throw new Error("Invalid 'proxyUrl'. Must be a valid URL string.");
        }

        if (typeof config.categoryLabel !== 'string') {
            throw new Error("Invalid 'categoryLabel'. Must be a string.");
        }

        // Optional parameters validation (if necessary)
        if (config.containerId && typeof config.containerId !== 'string') {
            throw new Error("Invalid 'containerId'. Must be a string.");
        }
    }

    /**
     * Dynamically fetch the container element.
     *
     * @returns {HTMLElment} - The feed container element.
     */
    getFeedContainer() {
        const containerId = this.config.containerId || 'rss-feed';
        const container = document.getElementById(containerId);

        if (!container) {
            throw new Error(`Feed container with ID '${containerId}' not found in the DOM.`);
        }

        return container
    }

    /**
     * Initialize the Blogroll component by fetching and displaying feeds.
     */
    async loadFeeds() {
        const feedContainer = this.getFeedContainer()
        feedContainer.innerHTML = '<p>Loading latest posts...</p>';

        try {
            // Fetch and filter subscriptions by category
            const subscriptions = await fetchSubscriptions(this.config);
            const { feedsData, failedFeeds } = await fetchFeedsData(subscriptions, this.config);
            const sortedFeeds = sortFeedsByDate(feedsData);

            if (failedFeeds.length > 0) {
                console.warn('Failed to fetch data for the following feed IDs:', failedFeeds);
            }

            this.displayFeeds(sortedFeeds);
        } catch (error) {
            console.error('Error initializing blogroll:', error);
            feedContainer.innerHTML = '<p>Failed to load posts. Please try again later.</p>';
        }
    }


    /**
     * Render feeds into the container in a paginated way.
     *
     * @param {Array} feeds - Array of feed data objects.
     * @param {number} startIndex - Starting index of feeds to render.
     * @param {number} count - Number of feeds to render.
     **/
    renderFeeds(feeds, startIndex = 0) {
        const feedContainer = this.getFeedContainer();
        feeds.slice(startIndex, startIndex + this.config.batchSize).forEach(feed => {
            const feedItem = createFeedItem(feed);
            feedContainer.appendChild(feedItem);
        });
    }

    /**
     * Attach a "Show More" link to dynamically load more feeds.
     *
     * @param {HTMLElement} showMoreLink - The "Show More" link element.
     * @param {Array} feeds - Array of feed data objects.
     **/
    attachShowMoreHandler(showMoreLink, feeds) {
        const feedContainer = this.getFeedContainer();
        this.showMoreLink.addEventListener('click', (event) => {
            event.preventDefault();
            const currentCount = feedContainer.querySelectorAll('.feed-item').length;
            this.renderFeeds(feeds, currentCount);

            if (currentCount + this.config.batchSize >= feeds.length) {
                this.showMoreLink.style.display = 'none';
            }
        });
    }

    /**
     * Display the feeds in the container and manage "Show More" functionality.
     *
     * @param {Array} feeds - Array of sorted feed data objects.
     **/
    displayFeeds(feeds) {
        const feedContainer = this.getFeedContainer();
        feedContainer.innerHTML = ''; // Clear loading indicator

        if (feeds.length === 0) {
            feedContainer.innerHTML = '<p>No latest posts available at this time.</p>';
            return;
        }

        this.showMoreLink = createShowMoreLink();
        renderFeeds(feeds);

        if (feeds.length > 10) {
            this.showMoreLink.display = 'block';
            feedContainer.parentElement.appendChild(showMoreLink);
            this.attachShowMoreHandler(showMoreLink, feeds);
        }
    }
}

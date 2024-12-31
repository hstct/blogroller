import { fetchSubscriptions, fetchFeedsData } from './api/api.js';
import {
  sortFeedsByDate,
  createFeedItem,
  createShowMoreLink,
} from './utils/feed-utils.js';
import { constructApiUrl } from './utils/general-utils.js';
import { CONFIG } from './config.js';
import { DEFAULT_CONTAINER_ID, MESSAGES } from './constants.js';

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
    this.config = { ...CONFIG.defaults, ...config };

    // Validate the configuration
    this.validateConfig(this.config);

    if (!this.config.proxyUrl.endsWith('/')) {
      this.config.proxyUrl += '/';
    }

    // Construct derived URLs
    this.config.subscriptionUrl = constructApiUrl(
      this.config.proxyUrl,
      this.config.subscriptionEndpoint,
      { output: 'json' }
    );
    this.config.feedBaseUrl = constructApiUrl(
      this.config.proxyUrl,
      this.config.feedEndpoint
    );

    this.loadFeeds();
  }

  /**
   * Validate the configuration object.
   *
   * @param {Object} config - Configuration object.
   */
  validateConfig(config) {
    const requireParams = CONFIG.validation.requiredParams;
    const missingParams = requireParams.filter((param) => !config[param]);

    if (missingParams.length > 0) {
      throw new Error(
        MESSAGES.ERROR.MISSING_PARAMETER(missingParams.join(', '))
      );
    }

    if (
      typeof config.proxyUrl !== 'string' ||
      !config.proxyUrl.startsWith('http')
    ) {
      throw new Error(MESSAGES.ERROR.INVALID_PROXY_URL);
    }

    if (typeof config.categoryLabel !== 'string') {
      throw new Error(MESSAGES.ERROR.INVALID_CATEGORY_LABEL);
    }
  }

  /**
   * Dynamically fetch the container element.
   *
   * @returns {HTMLElment} - The feed container element.
   */
  getFeedContainer() {
    const containerId = this.config.containerId || DEFAULT_CONTAINER_ID;
    const container = document.getElementById(containerId);

    if (!container) {
      throw new Error(MESSAGES.ERROR.MISSING_CONTAINER(containerId));
    }

    return container;
  }

  /**
   * Initialize the Blogroll component by fetching and displaying feeds.
   */
  async loadFeeds() {
    const feedContainer = this.getFeedContainer();
    feedContainer.innerHTML = MESSAGES.LOADING;

    try {
      // Fetch and filter subscriptions by category
      const subscriptions = await fetchSubscriptions(this.config);
      const { feedsData, failedFeeds } = await fetchFeedsData(
        subscriptions,
        this.config
      );
      const sortedFeeds = sortFeedsByDate(feedsData);

      if (failedFeeds.length > 0) {
        console.warn(MESSAGES.ERROR.FETCH_FAILED, failedFeeds);
      }

      this.displayFeeds(sortedFeeds);
    } catch (error) {
      console.error(MESSAGES.ERROR.LOAD_FEEDS_FAILED, error);
      feedContainer.innerHTML = MESSAGES.LOAD_FAILED;
    }
  }

  /**
   * Render feeds into the container in a paginated way.
   *
   * @param {Array} feeds - Array of feed data objects.
   * @param {number} startIndex - Starting index of feeds to render.
   **/
  renderFeeds(feeds, startIndex = 0) {
    const feedContainer = this.getFeedContainer();
    const fragment = document.createDocumentFragment();
    const batch = feeds.slice(startIndex, startIndex + this.config.batchSize);

    batch.forEach((feed) => {
      const feedItem = createFeedItem(feed);
      fragment.appendChild(feedItem);
    });

    feedContainer.appendChild(fragment);
  }

  /**
   * Attach a "Show More" link to dynamically load more feeds.
   *
   * @param {Array} feeds - Array of feed data objects.
   **/
  attachShowMoreHandler(feeds) {
    this.showMoreLink.addEventListener('click', (event) => {
      event.preventDefault();

      const feedContainer = this.getFeedContainer();
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
      feedContainer.innerHTML = MESSAGES.NO_POSTS;
      return;
    }

    this.renderFeeds(feeds);

    if (feeds.length > this.config.batchSize) {
      this.showMoreLink = createShowMoreLink();
      this.showMoreLink.style.display = 'block';
      feedContainer.parentElement.appendChild(this.showMoreLink);
      this.attachShowMoreHandler(feeds);
    }
  }
}

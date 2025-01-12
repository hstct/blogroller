import { fetchAllLatest } from './api.js';
import { createFeedItem, createShowMoreLink } from './utils/dom.js';
import { calculateReadingTime, sortFeedsByDate } from './utils/common.js';
import { CONFIG } from './config.js';
import { DEFAULT_CONTAINER_ID, MESSAGES } from './constants.js';
import '../styles/blogroller.css';

/**
 * Class to handle Blogroll functionality.
 */
export class Blogroll {
  constructor() {
    this.config = null;
    this.showMoreLink = null;
    this.currentPage = 1;
    this.hasMoreFeeds = false;
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

    if (!container.classList.contains('blogroller-feed-container')) {
      container.classList.add('blogroller-feed-container');
    }

    return container;
  }

  /**
   * Initialize the Blogroll component by fetching and displaying feeds.
   */
  async loadFeeds() {
    const feedContainer = this.getFeedContainer();

    if (this.currentPage === 1) {
      feedContainer.innerHTML = MESSAGES.LOADING;
    }

    try {
      const aggregatorData = await fetchAllLatest({
        proxyUrl: this.config.proxyUrl,
        categoryLabel: this.config.categoryLabel,
        page: this.currentPage,
        limit: this.config.batchSize,
        n: 1,
      });

      const aggregatorFeeds = aggregatorData.feeds;

      if (!aggregatorFeeds || aggregatorFeeds.length === 0) {
        if (this.currentPage === 1) {
          feedContainer.innerHTML = MESSAGES.NO_POSTS;
        }
        return;
      }

      const feedsData = aggregatorFeeds.map((feed) => {
        const item = feed.items && feed.items[0];
        if (!item) {
          return {
            feedTitle: feed.title || 'Untitled Feed',
            feedUrl: feed.htmlUrl,
            feedIcon: feed.iconUrl,
            postTitle: 'No Posts',
            postUrl: '#',
            pubDate: null,
            readingTime: null,
          };
        }

        const publishedMs = item.published ? item.published * 1000 : NaN;
        const postContent = item.summary?.content || '';

        return {
          feedTitle: feed.title || 'Untitled Feed',
          feedUrl: feed.htmlUrl,
          feedIcon: feed.iconUrl,
          postTitle: item.title || 'Untitled Post',
          postUrl: item.alternate?.[0]?.href || '#',
          pubDate: isNaN(publishedMs) ? null : new Date(publishedMs),
          readingTime: calculateReadingTime(postContent),
        };
      });

      const sortedFeeds = sortFeedsByDate(feedsData);

      if (this.currentPage === 1) {
        feedContainer.innerHTML = '';
      }

      this.renderFeeds(sortedFeeds);

      const totalFeeds = aggregatorData.totalFeeds || aggregatorFeeds.length;
      const { page, limit } = aggregatorData;

      this.hasMoreFeeds =
        aggregatorFeeds.length === this.config.batchSize &&
        page * limit < totalFeeds;

      if (this.hasMoreFeeds) {
        this.ensureShowMoreLink(feedContainer);
      } else if (this.showMoreLink) {
        this.showMoreLink.style.display = 'none';
      }
    } catch (error) {
      console.error(MESSAGES.ERROR.LOAD_FEEDS_FAILED, error);
      feedContainer.innerHTML = MESSAGES.LOAD_FAILED;
    }
  }

  /**
   * Render feeds into the container in a paginated way.
   *
   * @param {Array} feeds - Array of feed data objects.
   **/
  renderFeeds(feeds) {
    const feedContainer = this.getFeedContainer();
    const fragment = document.createDocumentFragment();

    feeds.forEach((feed) => {
      const feedItem = createFeedItem(feed);
      fragment.appendChild(feedItem);
    });

    feedContainer.appendChild(fragment);
  }

  ensureShowMoreLink(feedContainer) {
    if (!this.showMoreLink) {
      this.showMoreLink = createShowMoreLink();
      feedContainer.parentElement.appendChild(this.showMoreLink);

      this.showMoreLink.addEventListener('click', (event) => {
        event.preventDefault();
        this.currentPage++;
        this.loadFeeds();
      });
    }
    this.showMoreLink.style.display = 'block';
  }
}

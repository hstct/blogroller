import { fetchDigest } from './api';
import { createFeedItem, createShowMoreLink } from './utils/dom';
import { calculateReadingTime } from './utils/common';
import { CONFIG } from './config';
import { DEFAULT_CONTAINER_ID, MESSAGES } from './constants';
import '../styles/blogroller.css';
import { AggregatorItem, AggregatorResponse, TransformedFeed } from './types';

interface BlogrollUserConfig {
  proxyUrl: string;
  categoryLabel: string;
  containerId?: string;
  batchSize?: number;
  documentClass?: string;
}

/**
 * Class to handle Blogroll functionality.
 */
export class Blogroll {
  // Exposed for testing
  public config!: Required<BlogrollUserConfig>;
  private showMoreLink: HTMLAnchorElement | null = null;
  private currentPage = 1;
  private hasMoreFeeds = false;

  /**
   * Initializes the Blogroll with a user config object.
   */
  public initialize(config: BlogrollUserConfig): void {
    const mergedConfig = { ...CONFIG.defaults, ...config };

    // Validate the configuration
    this.validateConfig(mergedConfig);

    this.config = {
      proxyUrl: mergedConfig.proxyUrl.endsWith('/')
        ? mergedConfig.proxyUrl
        : mergedConfig.proxyUrl + '/',
      categoryLabel: mergedConfig.categoryLabel,
      containerId: mergedConfig.containerId || DEFAULT_CONTAINER_ID,
      batchSize: mergedConfig.batchSize,
      documentClass: mergedConfig.documentClass,
    };

    void this.loadFeeds();
  }

  /**
   * Checks for missing or invalid parameters in the user config.
   */
  private validateConfig(config: Partial<BlogrollUserConfig>): void {
    const missingParams = CONFIG.validation.requiredParams.filter(
      (param) => !config[param as keyof BlogrollUserConfig]
    );
    if (missingParams.length > 0) {
      throw new Error(
        MESSAGES.ERROR.MISSING_PARAMETER(missingParams.join(', '))
      );
    }

    if (
      typeof config.proxyUrl !== 'string' ||
      !/^https?:\/\//.test(config.proxyUrl!)
    ) {
      throw new Error(MESSAGES.ERROR.INVALID_PROXY_URL);
    }

    if (typeof config.categoryLabel !== 'string') {
      throw new Error(MESSAGES.ERROR.INVALID_CATEGORY_LABEL);
    }
  }

  /**
   * Retrieves the container element by ID and applies default styling.
   */
  private getFeedContainer(): HTMLElement {
    const container = document.getElementById(this.config.containerId);

    if (!container) {
      throw new Error(
        MESSAGES.ERROR.MISSING_CONTAINER(this.config.containerId)
      );
    }

    if (!container.classList.contains('blogroller-feed-container')) {
      container.classList.add('blogroller-feed-container');
    }

    return container;
  }

  /**
   * Fetches and renders feeds based on the current scope.
   */
  private async loadFeeds(): Promise<void> {
    const feedContainer = this.getFeedContainer();

    if (this.currentPage === 1) {
      feedContainer.innerHTML = MESSAGES.LOADING;
    }

    try {
      const aggregatorData: AggregatorResponse = await fetchDigest({
        proxyUrl: this.config.proxyUrl,
        categoryLabel: this.config.categoryLabel,
        page: this.currentPage,
        limit: this.config.batchSize,
        n: 1,
      });

      const aggregatorItems = aggregatorData.items;

      if (!aggregatorItems || aggregatorItems.length === 0) {
        if (this.currentPage === 1) {
          feedContainer.innerHTML = MESSAGES.NO_POSTS;
        }
        return;
      }

      const transformed = this.transformFeeds(aggregatorItems);

      if (this.currentPage === 1) {
        feedContainer.innerHTML = '';
      }

      this.renderFeeds(transformed, aggregatorData);

      const { page, limit, totalItems } = aggregatorData;
      this.hasMoreFeeds =
        aggregatorItems.length === this.config.batchSize &&
        page * limit < totalItems;

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
   * Converts aggregator data into an array of TransformedFeed objects.
   */
  private transformFeeds(items: AggregatorItem[]): TransformedFeed[] {
    return items.map((item) => {
      const publishedMs = item.published ? item.published * 1000 : NaN;
      const postContent = item.summary?.content || '';
      return {
        feedTitle: item.feedTitle || 'Untitled Feed',
        feedUrl: item.feedHtmlUrl ?? '#',
        feedIcon: item.feedIconUrl,
        postTitle: item.title || 'Untitled Post',
        postUrl: item.alternate?.[0]?.href || '#',
        pubDate: isNaN(publishedMs) ? null : new Date(publishedMs),
        readingTime: calculateReadingTime(postContent),
      };
    });
  }

  /**
   * Renders feed items into the DOM.
   **/
  private renderFeeds(
    feeds: TransformedFeed[],
    aggregatorData: AggregatorResponse
  ): void {
    const feedContainer = this.getFeedContainer();
    const fragment = document.createDocumentFragment();

    feeds.forEach((feed) => {
      const feedItem = createFeedItem(feed);
      fragment.appendChild(feedItem);
    });

    feedContainer.appendChild(fragment);

    const { page, limit, items, totalItems } = aggregatorData;

    this.hasMoreFeeds =
      items.length === this.config.batchSize && page * limit < totalItems;

    if (this.hasMoreFeeds) {
      this.ensureShowMoreLink(feedContainer);
    } else if (this.showMoreLink) {
      this.showMoreLink.style.display = 'none';
    }
  }

  /**
   * Ensures a "Show More" link is present and wired up to load more feeds.
   */
  private ensureShowMoreLink(feedContainer: HTMLElement): void {
    if (!this.showMoreLink) {
      this.showMoreLink = createShowMoreLink();
      feedContainer.parentElement?.appendChild(this.showMoreLink);

      this.showMoreLink.addEventListener('click', (event) => {
        event.preventDefault();
        this.currentPage++;
        this.loadFeeds();
      });
    }
    this.showMoreLink.style.display = 'block';
  }
}

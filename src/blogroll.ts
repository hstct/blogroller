import { fetchDigest, fetchLabelStream } from './api';
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
  private useLabelEndpoint = false;
  private continuation: string | null = null;

  /**
   * Initializes the Blogroll with a user config object.
   */
  public initialize(config: BlogrollUserConfig): void {
    const mergedConfig = { ...CONFIG.defaults, ...config };

    // Peek at container for implicit label-mode and label value
    const containerId = config.containerId || DEFAULT_CONTAINER_ID;
    const containerEl = typeof document !== 'undefined'
      ? document.getElementById(containerId)
      : null;
    const dataLabel = containerEl?.dataset?.label;
    const dataEndpoint = containerEl?.dataset?.endpoint;
    const isSpecialId = containerEl?.id === 'rss-feed-label';
    const inferLabelMode = isSpecialId || dataEndpoint === 'label' || !!dataLabel;

    // Fill categoryLabel from DOM if not provided
    if (!mergedConfig.categoryLabel && dataLabel) {
      (mergedConfig as any).categoryLabel = dataLabel;
    }

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

    this.useLabelEndpoint = inferLabelMode;
    this.continuation = null;

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
      if (this.useLabelEndpoint) {
        const { items, continuation } = await fetchLabelStream({
          proxyUrl: this.config.proxyUrl,
          label: this.config.categoryLabel,
          n: this.config.batchSize,
          continuation: this.continuation ?? undefined,
        });

        if (!items || items.length === 0) {
          if (this.currentPage === 1) feedContainer.innerHTML = MESSAGES.NO_POSTS;
          return;
        }

        const transformed = this.transformFeeds(items);
        if (this.currentPage === 1) feedContainer.innerHTML = '';
        this.renderFeeds(transformed);

        this.continuation = continuation ?? null;
        this.hasMoreFeeds = Boolean(this.continuation) || items.length === this.config.batchSize;
        if (this.hasMoreFeeds) this.ensureShowMoreLink(feedContainer);
        else if (this.showMoreLink) this.showMoreLink.style.display = 'none';
      } else {
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

          this.renderFeeds(transformed);

          const { page, limit, totalItems } = aggregatorData;
          this.hasMoreFeeds =
            aggregatorItems.length === this.config.batchSize &&
            page * limit < totalItems;

          if (this.hasMoreFeeds) {
            this.ensureShowMoreLink(feedContainer);
          } else if (this.showMoreLink) {
            this.showMoreLink.style.display = 'none';
          }
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
  private renderFeeds(feeds: TransformedFeed[]): void {
    const feedContainer = this.getFeedContainer();
    const fragment = document.createDocumentFragment();

    feeds.forEach((feed) => {
      const feedItem = createFeedItem(feed);
      fragment.appendChild(feedItem);
    });

    feedContainer.appendChild(fragment);
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

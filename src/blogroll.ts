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
  private forceShowAll = false;
  private draining = false;

  /**
   * Initializes the Blogroll with a user config object.
   */
  public initialize(config: BlogrollUserConfig): void {
    const containerId = config.containerId || DEFAULT_CONTAINER_ID;
    const containerEl = typeof document !== 'undefined'
      ? document.getElementById(containerId)
      : null;
    const dataLabel = containerEl?.dataset?.label;
    const dataEndpoint = containerEl?.dataset?.endpoint;
    const isSpecialId = containerEl?.id === 'rss-feed-label';
    const inferLabelMode = isSpecialId || dataEndpoint === 'label' || !!dataLabel;

    const showAttr = containerEl?.dataset?.show?.toLowerCase();
    const showAllAttr = containerEl?.dataset?.showAll?.toLowerCase();
    this.forceShowAll =
      showAttr === 'all' ||
      showAllAttr === 'true' ||
      showAllAttr === '';

    const effectiveLabel = inferLabelMode && typeof dataLabel === 'string' && dataLabel.length > 0
      ? dataLabel
      : config.categoryLabel;

    const mergedConfig = { ...CONFIG.defaults, ...config, categoryLabel: effectiveLabel };

    // Validate the configuration
    this.validateConfig(mergedConfig);

    this.config = {
      proxyUrl: mergedConfig.proxyUrl.endsWith('/')
        ? mergedConfig.proxyUrl
        : mergedConfig.proxyUrl + '/',
      categoryLabel: mergedConfig.categoryLabel,
      containerId: containerId,
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
   * Load all remaining pages via continuation tokens.
   */
  private async loadAllRemainingLabel(): Promise<void> {
    if (!this.useLabelEndpoint || this.draining) return;
    this.draining = true;
    try {
      if (this.showMoreLink) {
        this.showMoreLink.textContent = 'Loading...';
        this.showMoreLink.style.pointerEvents = 'none';
      }
      const MAX_FETCHES = 50; // safety cap
      let iterations = 0;
      while (this.continuation && iterations < MAX_FETCHES) {
        const { items, continuation } = await fetchLabelStream({
          proxyUrl: this.config.proxyUrl,
          label: this.config.categoryLabel,
          n: this.config.batchSize,
          continuation: this.continuation,
        });
        if (!items || items.length === 0) break;
        const transformed = this.transformFeeds(items);
        this.renderFeeds(transformed);
        this.continuation = continuation ?? null;
        iterations++;
      }
      this.hasMoreFeeds = Boolean(this.continuation);
      if (this.showMoreLink) {
        if (this.hasMoreFeeds) {
          this.showMoreLink.textContent = 'Show All';
          this.showMoreLink.style.pointerEvents = '';
        } else {
          this.showMoreLink.style.display = 'none';
        }
      }
    } catch (e) {
      console.error(MESSAGES.ERROR.LOAD_FEEDS_FAILED, e);
      const feedContainer = this.getFeedContainer();
      feedContainer.insertAdjacentHTML('beforeend', MESSAGES.LOAD_FAILED);
      if (this.showMoreLink) {
        this.showMoreLink.textContent = 'Show All';
        this.showMoreLink.style.pointerEvents = ''
      }
    } finally {
      this.draining = false;
    }
  }

  /**
   * Load all remaining pages by paging until complete.
   */
  private async loadAllRemainingDigest(): Promise<void> {
    if (this.useLabelEndpoint || this.draining) return;
    this.draining = true;
    try {
      if (this.showMoreLink) {
        this.showMoreLink.textContent = 'Loading...';
        this.showMoreLink.style.pointerEvents = 'none';
      }
      const limit = this.config.batchSize;
      const MAX_FETCHES = 100;
      let nextPage = this.currentPage + 1;
      let iterations = 0;
      while (iterations < MAX_FETCHES) {
        const data: AggregatorResponse = await fetchDigest({
          proxyUrl: this.config.proxyUrl,
          categoryLabel: this.config.categoryLabel,
          page: nextPage,
          limit,
          n: 1,
        });
        const items = data.items || [];
        if (items.length === 0) break;
        const transformed = this.transformFeeds(items);
        this.renderFeeds(transformed);
        this.currentPage = data.page;
        iterations++;
        if (items.length < limit || data.page * data.limit >= data.totalItems) break;
        nextPage = data.page + 1;
      }
      this.hasMoreFeeds = false;
      if (this.showMoreLink) this.showMoreLink.style.display = 'none';
    } catch (e) {
      console.error(MESSAGES.ERROR.LOAD_FEEDS_FAILED, e);
      const feedContainer = this.getFeedContainer();
      feedContainer.insertAdjacentHTML('beforeend', MESSAGES.LOAD_FAILED);
      if (this.showMoreLink) {
        this.showMoreLink.textContent = 'Show All';
        this.showMoreLink.style.pointerEvents = '';
      }
    } finally {
      this.draining = false;
    }
  }

  /**
   * Ensures a "Show More" link is present and wired up to load more feeds.
   */
  private ensureShowMoreLink(feedContainer: HTMLElement): void {
    if (!this.showMoreLink) {
      this.showMoreLink = createShowMoreLink();
      if (this.forceShowAll) this.showMoreLink.textContent = 'Show All';
      feedContainer.parentElement?.appendChild(this.showMoreLink);

      this.showMoreLink.addEventListener('click', (event) => {
        event.preventDefault();
        if (this.forceShowAll) {
          if (this.useLabelEndpoint) {
            void this.loadAllRemainingLabel();
          } else {
            void this.loadAllRemainingDigest();
          }
        } else {
          this.currentPage++;
          this.loadFeeds();
        }
      });
    }
    this.showMoreLink.style.display = 'block';
  }
}

/** A single feed item returned by aggregatorData */
export interface FeedPost {
  title: string;
  published?: number;
  alternate?: Array<{ href: string }>;
  summary?: { content: string };
}

/** A feed object from aggregator endpoint. */
export interface AggregatorFeed {
  id: string;
  title?: string;
  htmlUrl?: string;
  iconUrl?: string;
  items?: FeedPost[];
}

/** The aggregator response shape from /all-latest. */
export interface AggregatorResponse {
  feeds: AggregatorFeed[];
  page: number;
  limit: number;
  totalFeeds: number;
}

export interface SortableFeed {
  pubDate: Date | null;
  [key: string]: unknown;
}

/** The shape we transform aggregator feeds into. */
export interface TransformedFeed extends SortableFeed {
  feedTitle: string;
  feedUrl: string;
  feedIcon?: string;
  postTitle: string;
  postUrl: string;
  readingTime: string | null;
}

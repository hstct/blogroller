export interface AggregatorItem {
  title: string;
  published?: number;
  alternate?: Array<{ href: string }>;
  summary?: { content: string };
  feedId?: string;
  feedTitle?: string;
  feedHtmlUrl?: string;
  feedIconUrl?: string;
  author?: string;
}

export interface AggregatorResponse {
  items: AggregatorItem[];
  page: number;
  limit: number;
  totalItems: number;
}

export interface SortableFeed {
  pubDate: Date | null;
  [key: string]: unknown;
}

export interface TransformedFeed extends SortableFeed {
  feedTitle: string;
  feedUrl: string;
  feedIcon?: string;
  postTitle: string;
  postUrl: string;
  readingTime: string | null;
}

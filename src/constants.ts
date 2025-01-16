export const DEFAULT_CONTAINER_ID = 'rss-feed';
export const PREFIX = '[Blogroll]';

export const MESSAGES = {
  LOADING: '<p>Loading latest posts...</p>',
  LOAD_FAILED: '<p>Failed to load posts. Please try again later.</p>',
  NO_POSTS: '<p>No latest posts available at this time.</p>',
  ERROR: {
    MISSING_CONTAINER: (id: string) =>
      `Feed container with ID '${id}' not found in the DOM.`,
    MISSING_PARAMETER: (param: string) =>
      `Missing required parameter(s): ${param}`,
    INVALID_PROXY_URL: "Invalid 'proxyUrl'. Must be a valid URL string.",
    INVALID_CATEGORY_LABEL: "Invalid 'categoryLabel'. Must be a string.",
    LOAD_FEEDS_FAILED: 'Error initializing blogroll.',
    FETCH_FAILED: `${PREFIX} Failed to fetch data for some feeds:`,
  },
  WARN: {
    NO_POSTS_FOR_ID: (id: string) =>
      `${PREFIX} No posts found for feed ID: ${id}`,
    INVALID_DATE_FOR_ID: (id: string) =>
      `${PREFIX} Invalid publish date for feed ID: ${id}`,
  },
};

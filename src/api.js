import { MESSAGES, PREFIX } from './constants.js';
import { calculateReadingTime } from './utils/common.js';

/**
 * A unified fetch wrapper that applies a standard referrer policy,
 * handles errors, and returns parsed JSON.
 *
 * @param {string} url - The URL to fetch.
 * @param {string} [errorMessage] - Custom error message for failures.
 * @param {string} [referrerPolicy] - Referrer policy for the request.
 * @returns {Promise<Any>} - Parsed JSON from the fetch.
 */
async function customFetch(
  url,
  errorMessage = 'Error fetching data',
  referrerPolicy = 'strict-origin-when-cross-origin'
) {
  const response = await fetch(url, { referrerPolicy });
  if (!response.ok) {
    throw new Error(`${PREFIX} ${errorMessage}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch subscription feeds filtered by a specific category label.
 *
 * @param {Object} config - The configuration object.
 * @param {string} config.subscriptionUrl - URL for fetching subscription feeds.
 * @param {string} categoryLabel - The category label to filter subscriptions by.
 * @returns {Promise<Array>} - A promise that resolves to an array of subscription feeds.
 */
export async function fetchSubscriptions({ subscriptionUrl }, categoryLabel) {
  let missingParams = [];
  if (!subscriptionUrl) missingParams.push('subscriptionUrl');
  if (!categoryLabel) missingParams.push('categoryLabel');

  if (missingParams.length > 0) {
    throw new Error(
      MESSAGES.ERROR.MISSING_PARAMETER_DETAIL(
        missingParams.join(', '),
        'fetchSubscriptions'
      )
    );
  }

  const data = await customFetch(
    subscriptionUrl,
    'Failed to fetch subscriptions'
  );

  return data.subscriptions.filter((feed) =>
    feed.categories.some((category) => category.label === categoryLabel)
  );
}

/**
 * Fetch the latest post data for a specific feed.
 *
 * @param {string} feedId - The ID of the feed.
 * @param {Object} config - The configuration object.
 * @param {string} config.proxUrl - Base URL for fetching feed content.
 * @return {Promise<Object|null>} - A promise that resolves to the latest post data or null.
 */
export async function fetchLatestPost(feedId, { proxyUrl }) {
  let missingParams = [];
  if (!feedId) missingParams.push('feedId');
  if (!proxyUrl) missingParams.push('proxyUrl');

  if (missingParams.length > 0) {
    throw new Error(
      MESSAGES.ERROR.MISSING_PARAMETER_DETAIL(
        missingParams.join(', '),
        'fetchLatestPost'
      )
    );
  }

  const feedUrl = `${proxyUrl}${feedId}?n=1`;

  const feedData = await customFetch(
    feedUrl,
    `Failed to fetch latest post for feed ID: ${feedId}`
  );

  if (!feedData.items || !feedData.items[0]) {
    console.warn(MESSAGES.WARN.NO_POSTS_FOR_ID(feedId));
    return null;
  }

  const latestPost = feedData.items[0];
  const pubDate = new Date(latestPost.published * 1000);

  if (isNaN(pubDate.getTime())) {
    console.warn(MESSAGES.WARN.INVALID_DATE_FOR_ID(feedId));
    return null;
  }

  return {
    postTitle: latestPost.title,
    postUrl: latestPost.alternate[0]?.href,
    pubDate: pubDate,
    readingTime: calculateReadingTime(latestPost.summary?.content || ''),
  };
}

/**
 * Fetch detailed data for a list of feeds.
 *
 * @param {Array} feeds - An array of feed objects.
 * @param {Object} config - The configuration object.
 * @return {Promise<Array>} - A promise that resolves to an array of feed data objets.
 **/
export async function fetchFeedsData(feeds, config) {
  const failedFeeds = []; // Track failed feed IDs

  const results = await Promise.all(
    feeds.map(async (feed) => {
      try {
        const latestPost = await fetchLatestPost(feed.id, config);
        if (!latestPost) {
          failedFeeds.push({
            id: feed.id,
            title: feed.title,
            error: 'No posts found',
          });
          return null;
        }

        return {
          feedTitle: feed.title,
          feedUrl: feed.htmlUrl,
          feedIcon: feed.iconUrl,
          ...latestPost,
        };
      } catch (error) {
        console.error(MESSAGES.ERROR.FETCH_FAILED, error);
        failedFeeds.push({
          id: feed.id,
          title: feed.title,
          error: error.message || 'Unknown error',
        });
        return null;
      }
    })
  );

  return {
    feedsData: results.filter(Boolean),
    failedFeeds,
  };
}

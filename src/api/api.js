import { calculateReadingTime } from "../utils/time.js";

/**
 * Fetch subscription feeds filtered by a specific category label.
 *
 * @param {Object} config - The configuration object.
 * @param {string} config.subscriptionUrl - URL for fetching subscription feeds.
 * @param {string} categoryLabel - The category label to filter subscriptions by.
 * @returns {Promise<Array>} - A promise that resolves to an array of subscription feeds.
 */
export async function fetchSubscriptions({ subscriptionUrl }, categoryLabel) {
    if (!subscriptionUrl || !categoryLabel) {
        throw new Error("Both 'subscriptionUrl' and 'categoryLabel' are required");
    }

    const response = await fetch(subscriptionUrl, {
        referrerPolicy: 'strict-origin-when-cross-origin',
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch subscriptions: ${response.statusText}`);
    }

    const data = await response.json();
    return data.subscriptions.filter(feed =>
        feed.categories.some(category => category.label === categoryLabel)
    );
}

/**
 * Fetch the latest post data for a specific feed.
 *
 * @param {string} feedId - The ID of the feed.
 * @param {Object} config - The configuration object.
 * @param {string} config.feedUrl - Base URL for fetching feed content.
 * @return {Promise<Object|null>} - A promise that resolves to the latest post data or null.
 */
export async function fetchLatestPost(feedId, { feedBaseUrl }) {
    if (!feedId || !feedBaseUrl) {
        throw new Error("Both 'feedId' and 'feedBaseUrl' are required.");
    }
    
    const feedUrl = `${feedBaseUrl}${encodeURIComponent(feedId)}?n=1`;
    const response = await fetch(feedUrl, {
        referrerPolicy: 'strict-origin-when-cross-origin',
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch latest post for feed ID: ${feedId}`);
    }

    const feedData = await response.json();
    const latestPost = feedData.items[0];

    if (!latestPost) {
        console.warn(`No posts found for feed ID: ${feedId}`);
        return null;
    }

    const pubDate = new Date(latestPost.published * 1000);

    if (isNaN(pubDate.getTime())) {
        console.warn(`Invalid publish date for feed ID: ${feedId}`);
        return null;
    }

    return {
        postTitle: latestPost.title,
        postUrl: latestPost.alternate[0].href,
        pubDate: pubDate,
        readingTime: calculateReadingTime(latestPost.summary.content),
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
        feeds.map(async feed => {
            try {
                const latestPost = await fetchLatestPost(feed.id, config);
                if (!latestPost) return null;

                return {
                    feedTitle: feed.title,
                    feedUrl: feed.htmlUrl,
                    feedIcon: feed.iconUrl,
                    ...latestPost,
                };
            } catch (error) {
                console.error(`Error fetching data for feed:`, error);
                failedFeeds.push(feed);
                return null;
            }
        })
    );

    return {
        feedsData: results.filter(Boolean),
        failedFeeds,
    }
}
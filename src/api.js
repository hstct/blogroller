import { PREFIX } from './constants.js';

/**
 * Fetch aggregated latest post for all feeds (or a labeled subset).
 *
 * @param {Object} options
 * @param {string} options.proxyUrl - Base proxy URL.
 * @param {string} [options.categoryLabel] - Label/category to filter feeds by.
 * @param {number} [options.page=1] - Which page of feeds to retrieve.
 * @param {number} [options.limit=10] - How many feeds to retrieve per page.
 * @param {number} [options.n=1] - How many items per feed (e.g. 1 for latest only).
 * @returns {Promise<Object>} - Parsed JSON from the `/all-latest` endpoint.
 */
export async function fetchAllLatest({
  proxyUrl,
  categoryLabel,
  page = 1,
  limit = 10,
  n = 1,
}) {
  const url = new URL(`${proxyUrl}all-latest`);

  if (categoryLabel) {
    url.searchParams.set('label', categoryLabel);
  }

  url.searchParams.set('page', page);
  url.searchParams.set('limit', limit);
  url.searchParams.set('n', n);

  const response = await fetch(url.toString(), {
    referrerPolicy: 'strict-origin-when-cross-origin',
  });

  if (!response.ok) {
    throw new Error(
      `${PREFIX} Aggregator error: HTTP ${response.status} - ${response.statusText}`
    );
  }

  return response.json();
}

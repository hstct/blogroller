import { PREFIX } from '../constants';

/**
 * A unified fetch wrapper that applies a standard referrer policy,
 * handles errors, and returns parsed JSON.
 *
 * @param {string} url - The URL to fetch.
 * @param {string} [errorMessage] - Custom error message for failures.
 * @param {string} [referrerPolicy] - Referrer policy for the request.
 * @returns {Promise<Any>} - Parsed JSON from the fetch.
 */
export async function customFetch(
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

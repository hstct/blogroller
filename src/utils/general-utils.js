/**
 * Escapes HTML special characters in a string.
 *
 * @param {string} input - The input string to sanitize.
 * @returns {string} - A sanitized string safe for embedding in HTML.
 */
export function escapeHTML(input) {
  if (typeof input !== 'string') {
    console.warn(
      'escapeHTML: Non-string input received. Returning empty string.'
    );
    return '';
  }
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validates a URL and ensures it uses a safe protocol.
 *
 * @param {string} url - The URL to validate.
 * @param {string} [fallback="#"] - The fallback value for invalid URLs.
 * @returns {string} - The validated URL or a placeholder.
 */
export function validateUrl(url, fallback = '#') {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      return url;
    }
  } catch {
    console.warn(`validateUrl: Invalid URL provided - ${url}`);
  }
  return fallback;
}

/**
 * Helper function to construct a URL with optional query parameters.
 *
 * @param {string} baseUrl - The base URL.
 * @param {string} endpoint - The endpoint to append to the base URL.
 * @param {Object} [queryParams] - Optional query parameters as key-value pairs.
 * @returns {string} - The constructed URL.
 */
export function constructApiUrl(baseUrl, endpoint, queryParams = {}) {
  const url = new URL(endpoint, baseUrl);
  Object.keys(queryParams).forEach((key) =>
    url.searchParams.append(key, queryParams[key])
  );
  return url.toString();
}

/**
 * Escapes HTML special characters in a string.
 *
 * @param {string} input - The input string to sanitize.
 * @returns {string} - A sanitized string safe for embedding in HTML.
 */
export function escapeHTML(input) {
  if (typeof input !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validates a URL and ensures it uses a safe protocol.
 *
 * @param {string} url - The URL to validate.
 * @returns {string} - The validated URL or a placeholder.
 */
export function validateUrl(url) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      return url;
    }
  } catch {
    // Invalid URL
  }
  return '#'; // Replace invalid or unsafe URL with a placeholder
}

import { PREFIX } from './constants';
import { AggregatorResponse } from './types';

interface FetchDigestOptions {
  proxyUrl: string;
  categoryLabel?: string;
  page?: number;
  limit?: number;
  n?: number;
}

/**
 * Fetches aggregated latest posts from the proxy's /digest endpoint.
 */
export async function fetchDigest({
  proxyUrl,
  categoryLabel,
  page = 1,
  limit = 10,
  n = 1,
}: FetchDigestOptions): Promise<AggregatorResponse> {
  const url = new URL(`${proxyUrl}digest`);

  if (categoryLabel) {
    url.searchParams.set('label', categoryLabel);
  }

  url.searchParams.set('page', page.toString());
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('n', n.toString());

  const response = await fetch(url.toString(), {
    referrerPolicy: 'strict-origin-when-cross-origin',
  });

  if (!response.ok) {
    throw new Error(
      `${PREFIX} Aggregator error: HTTP ${response.status} - ${response.statusText}`
    );
  }

  const data: AggregatorResponse = await response.json();
  return data;
}

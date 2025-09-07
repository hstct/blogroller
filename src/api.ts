import { PREFIX } from './constants';
import { AggregatorResponse, AggregatorItem } from './types';

interface FetchDigestOptions {
  proxyUrl: string;
  categoryLabel?: string;
  page?: number;
  limit?: number;
  n?: number;
}

interface FetchLabelOptions {
  proxyUrl: string;
  label: string;
  n?: number;
  continuation?: string;
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

/**
 * Fetches posts from the proxy's /label/<label> endpoint.
 * Returns AggregatorItem[] so the rest of the app can reuse the same transform/render path.
 */
export async function fetchLabelStream({
  proxyUrl,
  label,
  n = 10,
  continuation,
}: FetchLabelOptions): Promise<{ items: AggregatorItem[]; continuation?: string }> {
  const url = new URL(`${proxyUrl}label/${encodeURIComponent(label)}`);

  url.searchParams.set('n', String(n));
  url.searchParams.set('output', 'json');
  if (continuation) url.searchParams.set('c', continuation);

  const response = await fetch(url.toString(), {
    referrerPolicy: `strict-origin-when-cross-origin`,
  });

  if (!response.ok) {
    throw new Error(`${PREFIX} Label stream error: HTTP ${response.status} - ${response.statusText}`);
  }

  const raw = (await response.json()) as import('./types').LabelStreamResponse;

  const items: AggregatorItem[] = (raw.items ?? []).map((it) => ({
    title: it.title,
    published: it.published,
    alternate: it.alternate,
    summary: it.summary,
    feedId: it.origin?.streamId,
    feedTitle: it.origin?.title,
    feedHtmlUrl: it.origin?.htmlUrl,
    author: it.author,
  }));

  return { items, continuation: raw.continuation };
}

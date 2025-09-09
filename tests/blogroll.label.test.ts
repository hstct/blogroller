import { Blogroll } from '../src/blogroll';
import { fetchDigest, fetchLabelStream } from '../src/api';

jest.mock('../src/api', () => ({
  fetchDigest: jest.fn(),
  fetchLabelStream: jest.fn(),
}));

describe('Blogroll - label mode DOM override', () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<div id="rss-feed" data-endpoint="label" data-label="cool-label"></div>';
    jest.clearAllMocks();
  });

  test('uses label endpoint and DOM label even if JS label differs', async () => {
    (fetchLabelStream as jest.Mock).mockResolvedValueOnce({
      items: [
        {
          title: 'A',
          published: 1697000000,
          alternate: [{ href: 'https://a' }],
          feedTitle: 'F',
          feedHtmlUrl: 'https://f',
        },
      ],
      continuation: undefined,
    });

    const br = new Blogroll();
    br.initialize({
      proxyUrl: 'https://proxy.test/',
      containerId: 'rss-feed',
      categoryLabel: 'WRONG-LABEL',
      batchSize: 10,
    });

    await Promise.resolve();

    expect(fetchDigest).not.toHaveBeenCalled();
    expect(fetchLabelStream).toHaveBeenCalledTimes(1);
    expect((fetchLabelStream as jest.Mock).mock.calls[0][0]).toMatchObject({
      label: 'cool-label',
      proxyUrl: 'https://proxy.test/',
      n: 10,
    });

    const items = document.querySelectorAll('.blogroller-feed-item');
    expect(items.length).toBe(1);
  });
});

describe('Blogroll - label mode show-all', () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<div id="rss-feed" data-endpoint="label" data-label="cool-label" data-show="all"></div>';
    jest.clearAllMocks();
  });

  test('clicking Show All drains remaining label pages', async () => {
    (fetchLabelStream as jest.Mock).mockResolvedValueOnce({
      items: [
        {
          title: 'P1-A',
          published: 1697000000,
          alternate: [{ href: 'https://p1a' }],
          feedTitle: 'F',
          feedHtmlUrl: 'https://f',
        },
        {
          title: 'P1-B',
          published: 1697000001,
          alternate: [{ href: 'https://p1b' }],
          feedTitle: 'F',
          feedHtmlUrl: 'https://f',
        },
      ],
      continuation: 'c1',
    });

    (fetchLabelStream as jest.Mock).mockResolvedValueOnce({
      items: [
        {
          title: 'P2-A',
          published: 1697000002,
          alternate: [{ href: 'https://p2a' }],
          feedTitle: 'F',
          feedHtmlUrl: 'https://f',
        },
      ],
      continuation: 'c2',
    });

    (fetchLabelStream as jest.Mock).mockResolvedValueOnce({
      items: [
        {
          title: 'P3-A',
          published: 1697000003,
          alternate: [{ href: 'https://p3a' }],
          feedTitle: 'F',
          feedHtmlUrl: 'https://f',
        },
      ],
      continuation: undefined,
    });

    const br = new Blogroll();
    br.initialize({
      proxyUrl: 'https://proxy.test/',
      containerId: 'rss-feed',
      categoryLabel: 'ignored-by-dom',
      batchSize: 2,
    });

    await Promise.resolve();

    let items = document.querySelectorAll('.blogroller-feed-item');
    expect(items.length).toBe(2);
    const btn = document.getElementById('blogroller-show-more') as HTMLAnchorElement;
    expect(btn).not.toBeNull();
    expect(btn.textContent).toMatch(/Show All/i);

    btn.click();
    await Promise.resolve();
    await Promise.resolve();

    items = document.querySelectorAll('.blogroller-feed-item');
    expect(items.length).toBe(4);

    expect((document.getElementById('blogroller-show-more') as HTMLAnchorElement).style.display).toBe('none');

    expect((fetchLabelStream as jest.Mock).mock.calls.length).toBe(3);
  });
});

describe('Blogroll - digest mode show-all', () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<div id="rss-feed" data-show="all"></div>';
    jest.clearAllMocks();
  });

  test('clicking Show All drains remaining digest pages', async () => {
    (fetchDigest as jest.Mock).mockResolvedValueOnce({
      items: [
        {
          title: 'D1-A',
          published: 1697000000,
          alternate: [{ href: 'https://d1a' }],
          feedTitle: 'F',
          feedHtmlUrl: 'https://f',
        },
        {
          title: 'D1-B',
          published: 1697000001,
          alternate: [{ href: 'https://d1b' }],
          feedTitle: 'F',
          feedHtmlUrl: 'https://f',
        },
      ],
      page: 1,
      limit: 2,
      totalItems: 5,
    });

    (fetchDigest as jest.Mock).mockResolvedValueOnce({
      items: [
        {
          title: 'D2-A',
          published: 1697000002,
          alternate: [{ href: 'https://d2a' }],
          feedTitle: 'F',
          feedHtmlUrl: 'https://f',
        },
        {
          title: 'D2-B',
          published: 1697000003,
          alternate: [{ href: 'https://d2b' }],
          feedTitle: 'F',
          feedHtmlUrl: 'https://f',
        },
      ],
      page: 2,
      limit: 2,
      totalItems: 5,
    });

    (fetchDigest as jest.Mock).mockResolvedValueOnce({
      items: [
        {
          title: 'D3-A',
          published: 1697000004,
          alternate: [{ href: 'https://d3a' }],
          feedTitle: 'F',
          feedHtmlUrl: 'https://f',
        },
      ],
      page: 3,
      limit: 2,
      totalItems: 5,
    });

    const br = new Blogroll();
    br.initialize({
      proxyUrl: 'https://proxy.test/',
      containerId: 'rss-feed',
      categoryLabel: 'favs',
      batchSize: 2,
    });

    await Promise.resolve();

    let items = document.querySelectorAll('.blogroller-feed-item');
    expect(items.length).toBe(2);

    const btn = document.getElementById('blogroller-show-more') as HTMLAnchorElement;
    expect(btn).not.toBeNull();
    expect(btn.textContent).toMatch(/Show All/i);

    btn.click();
    await Promise.resolve();
    await Promise.resolve();

    items = document.querySelectorAll('.blogroller-feed-item');
    expect(items.length).toBe(5);

    expect((document.getElementById('blogroller-show-more') as HTMLElement).style.display).toBe('none');
    expect((fetchDigest as jest.Mock).mock.calls.length).toBe(3);
  });
});

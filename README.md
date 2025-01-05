# Blogroller

A lightweight JavaScript library for fetching and displaying RSS feeds from a FreshRSS instance, offering a "blogroll" experience similar to the Google Blogger widget.

- **Fetch** feeds from a proxy-protected FreshRSS instance
- **Display** them in an easy-to-browse list
- **Auto-calculate** reading time & relative dates
- **Paginate** with a "Show More" link and custom batch size

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Usage](#usage)
   - [Basic Example](#basic-example)
   - [CDN / Script Tag](#cdn--script-tag)
   - [ES Module Import](#es-module-import)
4. [Configuration & API](#configuration--api)
5. [License](#license)
6. [Contributing](#contributing)

---

## Overview

**Blogroller** helps you display a list of the latest posts from multiple RSS feeds. You can fetch them through a **proxy** (to hide credentials and unify requests) and show them in a neat, paginated list with reading-time estimates and relative "published X days ago" labels.

**Features**:

- Automatic reading time calculation based on word count
- Relative "time ago" stamps (e.g., "2 days ago")
- Batch-based pagination with a "Show More" link
- Graceful error handling (missing feeds, empty categories)
- Configurable via a simple JavaScript object

---

## Installation

### Via NPM

```bash
npm install blogroller
```

Then import in your code:

```js
import { Blogroll } from 'blogroller';
```

### CDN / Script Tag

You can also load **Blogroller** from a CDN like **jsDelivr**:

```html
<script src="https://cdn.jsdelivr.net/npm/blogroller@1.0.0/dist/blogroller.umd.js"></script>
<script>
  const blogroll = new Blogroller.Blogroll();
  blogroll.initialize({
    proxyUrl: 'https://your-proxy-url/',
    categoryLabel: 'myCategory',
  });
</script>
```

This exposes a global `Blogroller` object (i.e., `window.Blogroller`).

---

## Usage

### Basic Example

Assume you have a `<div id="rss-feed"></div>` in your HTML. Then:

```js
import { Blogroll } from 'blogroller';

const blogroll = new Blogroll();
blogroll.initialize({
  proxyUrl: 'https://example-proxy.com/',
  categoryLabel: 'myCategory',
  batchSize: 5,
  containerId: 'rss-feed',
});
```

- `proxyUrl`: The URL to your FreshRSS or custom proxy endpoint.
- `categoryLabel`: The label (or category) of the feeds in your FreshRSS instance you want to display.
- `batchSize`: How many items to display initially (optional, default 10).
- `containerId`: The DOM element ID to render the blogroll into (optional, default `'rss-feed'`).

**Result**: A blogroll that shows the latest posts from feeds that have the label "myCategory". If there are more than 5 items, a "Show More" link appears.

### CDN / Script Tag

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Blogroller Example</title>
  </head>
  <body>
    <div id="rss-feed"></div>

    <script src="https://cdn.jsdelivr.net/npm/blogroller@1.0.0/dist/blogroller.umd.js"></script>

    <script>
      const blogroll = new Blogroller.Blogroll();
      blogroll.initialize({
        proxyUrl: 'https://example.com/my-proxy/',
        categoryLabel: 'favorites',
        batchSize: 5,
        containerId: 'rss-feed',
      });
    </script>
  </body>
</html>
```

**Note**: The `Blogroller` global becomes available after the script loads.

### ES Module Import

```js
import { Blogroller } from 'blogroller/dist/blogroller.esm.js';

const blogroll = new Blogroll();
blogroll.initialize({
  proxyUrl: 'https://example.com/my-proxy/',
  categoryLabel: 'myCategory',
});
```

---

## Configuration & API

`Blogroll` class provides:

- `initialize(config)`
  - `proxyUrl` _(string, required)_: The base URL to your FreshRSS proxy.
  - `categoryLabel` _(string, required)_: The feed category label for filter subscriptions.
  - `containerId` _(string, default `"rss-feed"`)_: The DOM element ID to render the blogroll.
  - `batchSize` _(number, defaul `10`)_: How many items to display per batch.
  - `subscriptionEndpoint` _(string, default `"subscription/list"`)_: Proxy endpoint to fetch subscription feeds.
  - `feedEndpoin` _(string, default `"stream/contents"`)_: Proxy endpoint to fetch feed contents.
- `loadFeeds()` _(async)_: Manually fetches feeds and displays them. It's automatically called by `initialize()`, but you can re-trigger it if needed.
- `displayFeeds(feeds)` Renders the given array of feed data. Typically only called internally, but you can override or extend for custom logic.

**Error Handling**

- If a feed fails to load, the code logs an error to `console.error` and continues loading other feeds.
- If no posts are found, it logs a warning but does not break.

**Reading Time Calculation:**

- Based on ~250 wpm.

**Relative Dates:**

- Uses a custom `getRelativeDate(pubDate)` function to display "X days ago".

---

## License

This library is open-sourced under the **MIT** license, which means you can use it for free in commercial or personal projects, with minimal restrictions.

---

## Contributing

Contributions are welcome! Feel free to open issues or pull requests. If you'd like to add a new feature, kindly open an issue first to discuss it.

1. **Fork** the repo
2. **Create** a new branch: `git checkout -b feature/awesome-feature`
3. **Commit** your changes: `git commit -m "Add awesome feature"`
4. **Push** to your branch: `git push origin feature/awesome-feature"`
5. **Open a Pull Request** on GitHub

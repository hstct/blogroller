# Blogroller

A lightweight JavaScript library for fetching and displaying RSS feeds from a FreshRSS instance, offering a "blogroll" experience similar to the Google Blogger widget.

## Overview

**Blogroller** helps you display a list of the latest posts from multiple RSS feeds. It fetches them through a **proxy** (to hide credentials and unify requests) and shows them in a neat, paginated list with reading-time estimates and relative "published X days ago" labels.

## Features

- **Automatic Reading Time Calculation**: Estimates reading time based on word count.
- **Relative "Time Ago" Stamps**: Displays how long ago a post was published (e.g., "2 days ago").
- **Batch-Based Pagination**: Loads feeds in batches with a "Show More" link.
- **Graceful Error Handling**: Manages missing feeds and empty categories without breaking.
- **Configurable**: Easily customize via a simple JavaScript object.
- **Styling Customization**: Modify appearance using CSS variables or custom CSS.

## Setup FreshRSS Proxy

**Blogroller** requires a FreshRSS proxy to securely access your FreshRSS instance's API and protect your credentials. We recommend [FreshProxy](https://github.com/hstct/FreshProxy), a Python Flask application you can host separately. By default, FreshProxy now provides a single `/digest` endpoint that returns JSON data shaped like:
```json
{
  "items": [
    {
      "title": "Some Post",
      "published": 1697000000,
      "feedId": "feed/123",
      "feedTitle": "Example Feed",
      "feedHtmlUrl": "https://example.com",
      "feedIconUrl": "https://example.com/icon.png",
      "alternate": [{ "href": "https://example.com/post" }]
    }
    // ...
  ],
  "page": 1,
  "limit": 50,
  "totalItems": 123
}
```

**Note**: Deploy the Flask app to a hosting service (e.g. Heroku, AWS, DigitalOcean) to make it accessible via a public URL. Please check the [FreshProxy repo](https://github.com/hstct/FreshProxy) for detailed instructions on configuration and environment variables.

## Installation

### Via NPM

Install **Blogroller** using npm:

```bash
npm install blogroller
```

Then import in your code:

```js
import { Blogroll } from 'blogroller';
```

### CDN / Script Tag

You can also load **Blogroller** from a CDN like unpkg:

```html
<!-- Include Blogroller CSS -->
<link
  rel="stylesheet"
  href="https://unpkg.com/blogroller@latest/dist/blogroller.css"
/>

<!-- Include Blogroller JS -->
<script src="https://unpkg.com/blogroller@latest/dist/blogroller.umd.js"></script>

<script>
  const blogroll = new Blogroller.Blogroll();
  blogroll.initialize({
    proxyUrl: 'https://your-proxy-url/',
    categoryLabel: 'myCategory',
    batchSize: 10, // Optional: defaults to 10
    containerId: 'rss-feed', // Optional: defaults to 'rss-feed'
  });
</script>
```

This exposes a global `Blogroller` object (i.e., `window.Blogroller`).

## Styling Options

**Blogroller** provides default styling via the `blogroller.css` file, which you can customize to match your site's design. You can override the default styles using CSS variables or by adding your own CSS rules.

### Customizing Styles

You can override the default CSS variables to customize colors. For example:

```css
:root {
  --blogroller-border-color: #3c3836;
  --blogroller-feed-title-color: #d79921;
  --blogroller-feed-title-hover-bg: #d79921;
  --blogroller-feed-title-hover-color: #282828;
  --blogroller-link-color: #83a598;
  --blogroller-link-hover-color: #282828;
  --blogroller-text-italic-color: #98971a;
  --blogroller-text-italic-hl-color: #b8bb26;
}
```

Alternatively, you can write your own CSS rules targeting the `.blogroller-*` classes to fully customize the appearance.

## Usage

### Basic Example

Assume you have a `<div id="rss-feed"></div>` in your HTML. Then:

```js
import { Blogroll } from 'https://unpkg.com/blogroller@latest/dist/blogroller.esm.js';

const blogroll = new Blogroll();
blogroll.initialize({
  proxyUrl: 'https://example-proxy.com/',
  categoryLabel: 'myCategory',
  batchSize: 5,
  containerId: 'rss-feed',
});
```

**Parameters:**

- `proxyUrl` _(string, required)_: The URL to your FreshRSS proxy.
- `categoryLabel` _(string, required)_: The label (or category) of the feeds in your FreshRSS instance you want to display.
- `batchSize` _(number, optional)_: How many items to display initially (optional, default 10).
- `containerId` _(string, optional)_: The DOM element ID to render the blogroll into (optional, default `'rss-feed'`).

**Result**: A blogroll that shows the latest posts from feeds that have the label "myCategory". If there are more than 5 items, a "Show More" link appears.

## Contributing

Contributions are welcome! Feel free to open issues or pull requests. If you'd like to add a new feature, kindly open an issue first to discuss it.

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/awesome-feature`
3. Commit your changes: `git commit -m "Add awesome feature"`
4. Push to your branch: `git push origin feature/awesome-feature"`
5. Open a Pull Request on GitHub.

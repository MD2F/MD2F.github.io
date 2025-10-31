# Documentation

## Usage

MD2F is a web-based Markdown loader and viewer that allows you to display Markdown files directly in your browser with optional custom themes.

You can access the viewer using:

```
md2f.github.io/?url=markdown_url
```

**Examples:**

```
md2f.github.io/?url=https://example.com/readme.md
md2f.github.io/?url=https://example.com/readme.md&theme=https://md2f.github.io/themes/dark.css
```

## Features

### URL Parameters

* `?url=` - URL of the Markdown file to load.
* `&theme=` - URL of a custom CSS theme to style the Markdown content.

### Toolbar Options

* **Raw** - View the raw Markdown source.
* **HTML** - View the rendered HTML.
* **Download HTML** - Download the rendered HTML file.
* **Download Raw** - (Currently unavailable) Download the raw Markdown file.

### API Usage

MD2F also provides direct API access:

* `md2f.github.io/raw/?url=markdown_url` - Retrieve the raw Markdown content.
* `md2f.github.io/html/?url=markdown_url` - Retrieve the rendered HTML content.

**API Examples:**

```
https://md2f.github.io/raw/?url=https://example.com/sample.md
https://md2f.github.io/raw/?url=https://example.com/sample.md&theme=https://md2f.github.io/themes/dark.css
https://md2f.github.io/html/?url=https://example.com/sample.md
https://md2f.github.io/html/?url=https://example.com/sample.md&theme=https://md2f.github.io/themes/dark.css
```

## How To

1. Open your browser and go to `md2f.github.io/?url=your_markdown_file_url`.
2. Optionally, add `&theme=your_theme_url` to apply a custom theme.
3. Use the toolbar to switch between Raw and HTML views.
4. Click 'Download HTML' to save the rendered HTML.
5. If you want the raw Markdown, check back when 'Download Raw' becomes available.
6. For API access, use the `/raw/` or `/html/` endpoints directly with your Markdown URL.

## 404 Handling

* If the specified Markdown file cannot be found or loaded, MD2F will display a **404 Not Found** message.
* The viewer will automatically fallback to a 404 Markdown file located at `res/md/404.md`.
* The API endpoints will return an appropriate error response indicating the file could not be retrieved.

## Additional Notes

* The viewer supports relative paths for images and links. If a Markdown file contains relative paths, they will resolve relative to the file's URL.
* Supports GitHub-flavored Markdown including:

  * Headers, bold, italic, blockquotes
  * Ordered and unordered lists
  * Nested lists
  * Tables
  * Links and images
* Themes can be applied dynamically via the `&theme=` parameter to allow custom styling.
* Future improvements may include additional download options and live editing features.
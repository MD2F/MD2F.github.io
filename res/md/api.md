# API Documentation

MD2F provides simple API endpoints to access Markdown content and rendered HTML.

## Endpoints

### Raw Markdown

Retrieve the raw Markdown converted HTML content from a URL.

```
GET md2f.github.io/raw/?url=markdown_url
```

**Optional theme parameter** (applies CSS when rendering raw for preview purposes):

```
GET md2f.github.io/raw/?url=markdown_url&theme=theme_url
```

**Example:**

```
https://md2f.github.io/raw/?url=https://example.com/sample.md
https://md2f.github.io/raw/?url=https://example.com/sample.md&theme=https://md2f.github.io/themes/dark.css
```

### Rendered HTML

Retrieve the Markdown as rendered HTML.

```
GET md2f.github.io/html/?url=markdown_url
```

**Optional theme parameter** (applies CSS to the HTML output):

```
GET md2f.github.io/html/?url=markdown_url&theme=theme_url
```

**Example:**

```
https://md2f.github.io/html/?url=https://example.com/sample.md
https://md2f.github.io/html/?url=https://example.com/sample.md&theme=https://md2f.github.io/themes/dark.css
```

## Notes

* Relative paths inside the Markdown are resolved relative to the Markdown file URL.
* If the Markdown file is not available, the API will fallback to a default Markdown content.
* Use the `theme` parameter to apply custom CSS themes for both raw and HTML endpoints.

*This documentation provides a quick reference for using MD2F's API effectively.*

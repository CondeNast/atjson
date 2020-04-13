---
title: HTML
---

The HTML source turns an HTML document into an annotated document, with the raw HTML source as the text, and all the tags (and attributes) as annotations.

## Getting Started

Install the HTML source using `npm`:

```bash
npm install --save @atjson/source-html
```

## Insights into your HTML

The HTML source is particularly useful to take HTML and be able to modernize it into a rich experience, for example. We've taken a complex static / JS rendered webpage and turned it into a React application using atjson at Condé Nast as an example of how powerful this can be.

## How Annotations are generated

We dynamically generate the HTML annotations for this package directly from the [WHATWG HTML spec](https://html.spec.whatwg.org/multipage). To regenerate the annotations for this source, run the script in `scripts/generate-annotations.js`:

```bash
node ./scripts/generate-annotations.js
```

This will regenerate all files in the annotations directory, so beware! Any manual changes can and probably will be overridden by this script in the future, as the HTML spec evolves over time.

## Putting it together

This source can be used to parse and convert HTML pages into another form of markup, like markdown. The snippet of code to do this is:

```ts
import HTMLSource from "@atjson/source-html";
import CommonMarkRenderer from "@atjson/renderer-commonmark";
import OffsetSource from "@atjson/offset-annotations";

function htmlToMarkdown(html: string) {
  return CommonMarkRenderer.render(
    HTMLSource.fromRaw(html).convertTo(OffsetSource)
  );
}
```

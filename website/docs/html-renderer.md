---
title: HTML
---

Take an annotated document and render it into HTML. By default, this will take an offset document and render it to HTML.

## Getting Started

Install the HTML renderer using `npm`:

```bash
npm install --save @atjson/renderer-html
```

## Extending

The HTML renderer has a `$` method that's designed to make it easy to extend and write your own output to HTML.

To extend the current HTML renderer to support YouTube embeds (the kind that show up when you use the share menu), we'd use the following code:

```ts
import { YouTubeEmbed } from "@atjson/schema-offset";
import HTMLRenderer from "@atjson/renderer-html";

export default class MyHTMLRenderer extends HTMLRenderer {
  *YoutubeEmbed(embed: YouTubeEmbed) {
    return yield* this.$("iframe", {
      width: embed.attributes.width,
      height: embed.attributes.height,
      src: embed.attributes.url,
      frameborder: "0",
      allow:
        "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
      allowfullscreen: true
    });
  }
}
```

<!--
  Below, we're actually using the above code to generate
  the YouTube <iframe> and the DOM rendered from this.
-->

import { HTMLRendererDemo } from "../src/components/HTMLRendererDemo.tsx";

<HTMLRendererDemo />

---
title: URL expansion
---

This source transforms URLs into annotations. It allows a text editor to auto-unfurl URLs into annotations, most commonly used for social media embeds and videos.

## How to use

To give add this new capability to your text editor, first up, you'll need to install the source into your project:

```bash
npm install --save @atjson/source-url
```

After installing the source, next up is adding this source to the text editor's paste handler. Each text editor is different, so please look up the hooks that your editor uses to take advantage!

For this example, we'll show how to integrate this feature with [CKEditor](https://ckeditor.com).

A rough outline of what would be necessary to turn a pasted URL into a rich embed requires the following bits:

1. The URL source
2. A renderer to export the AtJSON document into a format understood by the editor
3. A bit of glue to turn the pasted text into the rich version of that text.

The block of code below gives a rough outline of how to organize and put together the necessary code to get paste working for CKEditor.


```js
import URLSource from '@atjson/source-url';
import Renderer from '@atjson/renderer-hir';

class CKEditorRenderer extends Renderer {
  *'facebook-embed'(embed) {
    return `<oembed>${embed.attributes.url}</oembed>`;
  }
  *'giphy-embed'(embed) {
    return `<oembed>${embed.attributes.url}</oembed>`;
  }
  *'iframe-embed'(embed) {
    return `<oembed>${embed.attributes.url}</oembed>`;
  }
  *'instagram-embed'(embed) {
    return `<oembed>${embed.attributes.url}</oembed>`;
  }
  *'pinterest-embed'(embed) {
    return `<oembed>${embed.attributes.url}</oembed>`;
  }
  *'twitter-embed'(embed) {
    return `<oembed>${embed.attributes.url}</oembed>`;
  }
  *'youtube-embed'(embed) {
    return `<oembed>${embed.attributes.url}</oembed>`;
  }
  *'root'() {
    let chunks = yield;
    return chunks.join('');
  }
}

editor.on('paste', function (evt) {
  let richPaste = new URLSource(evt.data.dataValue);
  let renderer = new CKEditorRenderer();
  evt.data.dataValue = renderer.render(richPaste.toCommonSchema());
});
```

## Supported embeds

- Instagram
- Twitter
- Pinterest
- Youtube
- Giphy
- Facebook

## Inspect

import { URLPaste } from '../src/components/URLPaste.tsx'

<URLPaste />

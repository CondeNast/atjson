# 🛸 @atjson/source-url

This source transforms URLs into annotations. It allows Offset to auto-unfurl URLs into annotations, most commonly used for social media embeds and videos.

## 🖍 How to use

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

<summary>
The block of code (hidden) below gives a rough outline of how to organize and put together the necessary code to get paste working for CKEditor.
<details>

```js
import OffsetSource from '@atjson/offset-annotations';
import URLSource from '@atjson/source-url';
import Renderer from '@atjson/renderer-hir';

class CKEditorRenderer extends Renderer {
  *FacebookEmbed'(embed) {
    return `<oembed>${embed.attributes.url}</oembed>`;
  }
  *GiphyEmbed(embed) {
    return `<oembed>${embed.attributes.url}</oembed>`;
  }
  *IframeEmbed(embed) {
    return `<oembed>${embed.attributes.url}</oembed>`;
  }
  *InstagramEmbed(embed) {
    return `<oembed>${embed.attributes.url}</oembed>`;
  }
  *PinterestEmbed(embed) {
    return `<oembed>${embed.attributes.url}</oembed>`;
  }
  *TwitterEmbed(embed) {
    return `<oembed>${embed.attributes.url}</oembed>`;
  }
  *YouTubeEmbed(embed) {
    return `<oembed>${embed.attributes.url}</oembed>`;
  }
  *Root() {
    let chunks = yield;
    return chunks.join('');
  }
}

editor.on('paste', function (evt) {
  let richPaste = URLSource.fromRaw(evt.data.dataValue);
  let renderer = new CKEditorRenderer();
  evt.data.dataValue = renderer.render(richPaste.convertTo(OffsetSource));
});
```

</details>
</summary>

## 💁‍♀️ Supported embeds

- Instagram
- Twitter
- Pinterest
- YouTube
- Giphy
- Facebook
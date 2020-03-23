---
title: Custom Renderer
---

This renderer is designed to render out to hierarchical formats like HTML, markdown, and the DOM.

Renderers use generators to return the content around annotations so each annotation has contextual awareness of what's going on. Render functions are keyed on their annotation `type` (or the classified `type`). In addition, there are 3 special functions that can be overridden:

- `*renderAnnotation`, which will be called for _every_ annotation (even unknown annotations)
- `*root`, which is the root node of the document being rendered. Overriding this allows for output to be fixed accordingly (for example, `join`ing the `yield`ed contents when the string output is expected to be a string)
- `text`, which will be called for all text nodes.

## Writing a Renderer

Let's write a renderer for Slack! Slack has a simple message format that looks somewhat like markdown (but isn't). We'll use their documentation found [here](https://get.slack.help/hc/en-us/articles/202288908-Format-your-messages) to write this renderer.

First, install the package:

```bash
npm install --save @atjson/renderer-hir
```

And import it to the top of the file:

```ts
import Renderer from "@atjson/renderer-hir";

export default class SlackRenderer extends Renderer {}
```

We have a renderer that will return the text of the document we pass in! (yay!)

Let's make the renderer return a string instead of an array of strings:

```ts
import Renderer from "@atjson/renderer-hir";

export default class SlackRenderer extends Renderer {
  *root() {
    let text = yield;
    return text.join("");
  }
}
```

Let's start writing tests to verify what we're writing works. For this example we'll be using [🃏Jest](https://jestjs.io) as our testing framework.

We're going to use the `OffsetSource` as our source document and set of annotations, since it's provided with out-of-the-box support for the basic syntax that Slack supports.

```ts
import OffsetSource from "@atjson/offset-annotations";
import SlackRenderer from "../src";

describe("SlackRenderer", () => {
  test("it returns text", () => {
    let doc = new OffsetSource({
      content: "Hello!",
      annotations: [],
    });

    expect(SlackRenderer.render(doc)).toBe("Hello!");
  });
});
```

Let's add some test cases for this, from their docs:

```ts
import OffsetSource, { Bold, Italic, Strikethrough } from '@atjson/offset-annotations';
import SlackRenderer from '../src';

describe('SlackRenderer', () => {
  test('it returns text', () => { ... });

  test('bold', () => {
    let doc = new OffsetSource({
      content: 'To bold, surround your text with asterisks: your text',
      annotations: [new Bold({ start: 44, end: 53 })]
    });

    expect(SlackRenderer.render(doc)).toBe('To bold, surround your text with asterisks: *your text*');
  });

  test('italic', () => {
    let doc = new OffsetSource({
      content: 'To italicize, surround your text with underscores: your text',
      annotations: [new Italic({ start: 51, end: 60 })]
    });

    expect(SlackRenderer.render(doc)).toBe('To italicize, surround your text with underscores: _your text_');
  });

  test('strikethrough', () => {
    let doc = new OffsetSource({
      content: 'To strikethrough, surround your text with tildes: your text',
      annotations: [new Italic({ start: 50, end: 59 })]
    });

    expect(SlackRenderer.render(doc)).toBe('To strikethrough, surround your text with tildes: ~your text~');
  });
});
```

Running tests should result in 3 failing tests.

Now that we have some failing test cases, let's go back to our renderer and implement bold markup:

```ts
import Renderer from "@atjson/renderer-hir";

export default class SlackRenderer extends Renderer {
  *Bold() {
    let text = yield;
    return `*${text.join("")}*`;
  }

  *root() {
    let text = yield;
    return text.join("");
  }
}
```

We use `Bold` here as a convention to match the class name of the annotation. Alternatively, we can use the key `bold` to generate the markup (it's up to you how you want to write it 😉).

Running tests now should result in 2 failing tests. 🎉

Now that we've got the hang of the first one, let's bang out the other 2 failing tests:

```ts
import Renderer from "@atjson/renderer-hir";

export default class SlackRenderer extends Renderer {
  *Bold() {
    let text = yield;
    return `*${text.join("")}*`;
  }

  *Italic() {
    let text = yield;
    return `_${text.join("")}_`;
  }

  *Strikethrough() {
    let text = yield;
    return `~${text.join("")}~`;
  }

  *root() {
    let text = yield;
    return text.join("");
  }
}
```

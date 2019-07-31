---
title: 📖 Mobiledoc
---

[Mobiledoc](https://github.com/bustle/mobiledoc-kit) is a format created by [201 Created](https://www.201-created.com/) for use on [Bustle](https://www.bustle.com/).

The primary mechanism in which Mobiledoc provides extensibility is using two types of primitives, atoms and cards. Comparably, atoms are akin to inline annotations and cards map fairly cleanly to object annotations.

Mobiledoc's format is represented using HTML tags for built-in elements, which contain sections and markup.

## Getting Started

Install the Mobiledoc source using `npm`:

```bash
npm install --save @atjson/source-mobiledoc
```

## How does Mobiledoc map into annotations?

All markup and sections provided by Mobiledoc have corresponding annotations. These annotations are:

| Name          | Annotation type |
|---------------|-----------------|
| Links         | `-mobiledoc-a`  |
| Pull Quote    | `-mobiledoc-aside` |
|               | `-mobiledoc-pull-quote` |
| Headings      | `-mobiledoc-h1` |
|               | `-mobiledoc-h2` |
|               | `-mobiledoc-h3` |
|               | `-mobiledoc-h4` |
|               | `-mobiledoc-h5` |
|               | `-mobiledoc-h6` |
| Image         | `-mobiledoc-img` |
| Italic        | `-mobiledoc-em` |
| List Item     | `-mobiledoc-li` |
| Numbered List | `-mobiledoc-ol` |
| Bulleted List | `-mobiledoc-ol` |
| Paragraph     | `-mobiledoc-p` |
| Strike-through | `-mobiledoc-s` |
| Bold          | `-mobiledoc-strong` |
| Subscript     | `-mobiledoc-sub` |
| Superscript   | `-mobiledoc-sup` |
| Underline     | `-mobiledoc-u` |

If you are a developer using Mobiledoc and have made custom extensions to Mobiledoc to support more sections or other types of markup, the bits of code that you'll need are the following:

1. An annotation definition for your Mobiledoc extension
2. A custom extension of the Mobiledoc source

Let's do this for a custom extension that adds `code` to Mobiledoc's markups.

```ts
import { InlineAnnotation } from '@atjson/document';

export default Code extends InlineAnnotation {
  static vendorPrefix = 'mobiledoc';
  static type = 'code';
}
```

```ts
import MobiledocSource from '@atjson/source-mobiledoc';
import Code from './annotations/code';

export default MyMobiledocSource extends MobiledocSource {
  static schema = [...MobiledocSource.schema, Code];
}
```

Now, when a document with a `code` markup is converted from Mobiledoc into AtJSON, you'll see code annotations, instead of unknown annotations.

### Cards

Cards are Mobiledoc's primary tool for adding custom bits to documents. To turn a card into an annotation, you'll need to follow the same steps as adding a custom extension, except instead of naming it `code`, you'll name it the name of your card followed by `-card`. Because Mobiledoc has separate buckets for their extensions, we're adding `-card` to the end to make it easier to analyze your content as well as to make it clearer what's going on.

If there's a photo card in Mobiledoc, with `id`, `size`, and `caption` properties on it, we can map this into an annotation by writing the following code:

```ts annotations/photo-card.ts
import { ObjectAnnotation } from '@atjson/document';

export default PhotoCard extends ObjectAnnotation<{
  id: string;
  size: 'small' | 'medium' | 'large';
  caption?: string;
}> {
  static vendorPrefix = 'mobiledoc';
  static type = 'photo-card';
}
```

```ts my-mobiledoc-source.ts
import MobiledocSource from '@atjson/source-mobiledoc';
import PhotoCard from './annotations/photo-card';

export default MyMobiledocSource extends MobiledocSource {
  static schema = [...MobiledocSource.schema, PhotoCard];
}
```

### Atoms

Atoms work the same as cards, but instead of ending with `-card`, you'll end the name of your annotation with `-atom`.

Let's go through the exercise of adding a mention atom that works like Twitter handles or `@` mentions in Slack.

```ts
import { InlineAnnotation } from '@atjson/document';

export default MentionAtom extends InlineAnnotation {
  static vendorPrefix = 'mobiledoc';
  static type = 'mention-atom';
  attributes!: {
    id: string;
  };
}
```

```ts
import MobiledocSource from '@atjson/source-mobiledoc';
import MentionAtom from './annotations/mention-atom';

export default MyMobiledocSource extends MobiledocSource {
  static schema = [...MobiledocSource.schema, MentionAtom];
}
```

## What is a Mobiledoc? 

Mobiledoc is a JSON representation of a document with a few notable bits. The format is a compressed tree view of a document, where metadata about the document is _mostly_ stored apart from the contents.

Mobiledoc's storage format is most similar to AtJSON's heirarchical intermediate representation (hir), which shows a derived form of AtJSON's text + annotations model.

[Read up more on the format itself](https://github.com/bustle/mobiledoc-kit/blob/master/MOBILEDOC.md).


### Read More
- http://bustle.github.io/mobiledoc-kit/demo/docs/

# AtJSON [![CI](https://github.com/CondeNast/atjson/actions/workflows/ci.yml/badge.svg)](https://github.com/CondeNast/atjson/actions/workflows/ci.yml) [![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) [![Maintainability](https://api.codeclimate.com/v1/badges/4ee3591f9171333e235e/maintainability)](https://codeclimate.com/github/CondeNast/atjson/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/4ee3591f9171333e235e/test_coverage)](https://codeclimate.com/github/CondeNast/atjson/test_coverage)

## Maintainers

- Tim Evans (@tim-evans tim_evans@condenast.com)
- Blaine Cook (@blaine blaine_cook@condenast.com)

---

AtJSON is a collection of repositories that together make up a fully-realized content format.

| Quick Links                                                            |
| ---------------------------------------------------------------------- |
| [How does a document get rendered?](#how-does-a-document-get-rendered) |
| [How do I use existing documents?](#how-do-i-use-existing-documents)   |
| [How do I create a new document?](#how-do-i-create-a-new-document)     |

The breakdown of modules in this repository are:

| Modules                                                             | Description                                                                                             |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [@atjson/document](packages/@atjson/document)                       | AtJSON document and annotation code                                                                     |
| [@atjson/hir](packages/@atjson/hir)                                 | HIR (Hierarchical Intermediate Representation)                                                          |
| [@atjson/renderer-hir](packages/@atjson/renderer-hir)               | Abstract base class for text-based output                                                               |
| [@atjson/renderer-graphviz](packages/@atjson/renderer-graphviz)     | Used to visualise the HIR of a document                                                                 |
| [@atjson/renderer-plain-text](packages/@atjson/renderer-plain-text) | Plain text output                                                                                       |
| [@atjson/renderer-react](packages/@atjson/renderer-react)           | React output                                                                                            |
| [@atjson/renderer-commonmark](packages/@atjson/renderer-commonmark) | CommonMark output                                                                                       |
| [@atjson/source-commonmark](packages/@atjson/source-commonmark)     | Conversion of CommonMark sources to AtJSON                                                              |
| [@atjson/source-gdocs-paste](packages/@atjson/source-gdocs-paste)   | A source used to transform Google Docs Paste buffers into AtJSON                                        |
| [@atjson/source-html](packages/@atjson/source-html)                 | Conversion of HTML sources to AtJSON                                                                    |
| [@atjson/source-mobiledoc](packages/@atjson/source-mobiledoc)       | A source used to transform Mobiledoc into AtJSON                                                        |
| [@atjson/source-prism](packages/@atjson/source-prism)               | Conversion of [PRISM](http://www.prismstandard.org/specifications/)-compliant XML documents into AtJSON |
| [@atjson/source-url](packages/@atjson/source-url)                   | Turn URLs into rich embeds                                                                              |

#### Why another content format?

Our goals at Condé Nast are to provide best-in-class content to our readers, and best-in-class tools for our editors. To do this, we need a format that can be rich, extensible, and portable. It is important that the content source provide little ambiguity about _how_ a story should be displayed.

For Condé Nast, it is essential for our stories to be a format that doesn't age quickly- we have over a hundred years of articles from publications across the world. It is extremely important for us to be able to put these stories written for digital media in our archive for the future. Many current content formats do not strive for rigorousness in this, instead tying the constraints of the format to the current platform of choice. When constructing this format, we chose to separate the original text from the data associated for this purpose.

#### What does a document look like?

A document has a `content` field and a list of `annotations`, each of which have a spatial offset in the document.

The simplest document is one without annotations:

```js
{
  "content": "Hello"
  "annotations": []
}
```

Stylistic annotations are easily layered on a document using a positional annotation:

```js
{
  "content": "The best writing anywhere, everywhere.",
  "annotations": [{
    type: "-offset-italic",
    start: 4,
    end: 8,
    attributes: {}
  }]
}
```

This document looks like:

> The _best_ writing anywhere, everywhere.

Positions represent the space _in-between_ characters in the document. That means an annotation that starts at 0 starts before any character in the document. How the indexing works is as the following:

```
 H e l l o
^ ^ ^ ^ ^ ^
0 1 2 3 4 5
```

#### What can I use annotations for?

Annotations can be used for anything to describe the content.

Some common annotations for editorial purposes are comments and suggestions. Comments use annotation offsets to comment on a specific portion of the document:

```js
{
  "content": "Cat Person",
  "annotations": [{
    type: "-offset-comment",
    start: 0,
    end: 9
    attributes: {
      '-offset-author': "Eustace Tilley",
      '-offset-writtenAt': "2018-01-05 21:00T"
      '-offset-comment': "What about dog people?"
    }
  }]
}
```

In addition to comments, suggestions can be made to the text in the same manner as comments:

```js
{
  "content": "Reeducation",
  "annotations": [{
    type: "-offset-suggested-replacement",
    start: 2,
    end: 3
    attributes: {
      '-offset-text': "ë",
      '-offset-author': "Eustace Tilley",
      '-offset-suggestedAt': "2018-01-10 23:00T"
    }
  }]
}
```

Objects can also be embedded in documents that can be expanded when the document is reified to its final output:

```js
{
  "content": "￼",
  "annotations": [{
    type: "-offset-image",
    start: 0,
    end: 1,
    attributes: {
      '-offset-alt': "Logo",
      '-offset-url': ""
    }
  }]
}
```

### How does a document get rendered?

We have a source document with annotations:

![War and Peace](https://raw.githubusercontent.com/CondeNast/atjson/latest/public/war-and-peace.png)

This marked up document equates to:

```
War and Peace
Part First
Chapter I.

“Well, prince, Genoa and Lucca are now nothing more than apanages, than the private property of the Bonaparte family. I warn you that if you do not tell me we are going to have war, if you still allow yourself to condone all the infamies, all the atrocities of this Antichrist — on my word I believe he is Antichrist — that is the end of acquaintance; you are no longer my friend, you are no longer my faithful slave, as you call yourself. Now, be of good courage, I see I frighten you. Come, sit down and tell me all about it.”

It was on a July evening, 1805, that the famous Anna Pavlovna Scherer, maid of honor and confidant of the Empress Maria Feodorovna, thus greeted the influential statesman, Prince Vasili, who was the first to arrive at her reception.

Anna Pavlovna had been coughing for several days; she had the grippe, as she affected to call her influenza — grippe at that time being a new word only occasionally employed.

A number of little notes distributed that morning by a footman in red livery had been all couched in the same terms:—

“If you have nothing better to do, M. le Comte (or mon Prince), and if the prospect of spending the evening with a poor invalid is not too dismal, I shall be charmed to see you at my house between seven and ten. Annette Scherer”

“Oh! what a savage attack!” rejoined the prince, as he came forward in his embroidered tourt uniform, stockings, and diamond-buckled shoes, and with an expression of seren—
```

```js
[
  {
    type: "title",
    start: 0,
    end: 13,
    attributes: {
      level: 1,
    },
  },
  {
    type: "small-caps",
    start: 38,
    end: 42,
  },
  {
    type: "footnote",
    start: 37,
    end: 478,
    attributes: {
      note:
        "In the fifth edition of Count Tolstoï's works, this conversation is in a mixture of French and Russian. In the seventh (1887) the Russian entirely replaces the French — N. H. D.",
    },
  },
  {
    type: "italic",
    start: 863,
    end: 869,
  },
  {
    type: "italic",
    start: 911,
    end: 917,
  },
  {
    type: "blockquote",
    start: 1096,
    end: 1324,
  },
  {
    type: "small-caps",
    start: 1308,
    end: 1323,
  },
];
```

This visually would look like:

![War and Peace](https://raw.githubusercontent.com/CondeNast/atjson/latest/public/war-and-peace-annotated.png)

Creating an output is pretty straightforward, and requires no knowledge about the content format. You need to know about the annotations and what attributes they may contain. Generating output based on the hierarchical representation is straightforward and minimal.

Generating an HTML document from a document is all of this code:

```js
import Renderer, { escapeHTML } from "@atjson/renderer-hir";

export default class HTMLOutput extends Renderer {
  renderText(text: string): string {
    return new Text(escapeHTML(text));
  }

  *$(elementName: string, attributes: { [key: string]: string }) {
    let element = document.createElement(elementName);
    for (let key of attributes) {
      if (key === "class") {
        element.classList.add(attributes[key]);
      } else {
        element.setAttribute(key, attributes[key]);
      }
    }
    element.appendChildren(yield);
    return element;
  }

  *Title() {
    return yield* this.$("h1");
  }

  *Bold() {
    return yield* this.$("strong");
  }

  *Blockquote() {
    return yield* this.$("blockquote");
  }

  *Paragraph() {
    return yield* this.$("p");
  }

  *Italic() {
    return yield* this.$("em");
  }

  *SmallCaps() {
    return yield* this.$("span", { class: "small-caps" });
  }
}
```

The `renderText` method is called for every chunk of text in the document, to provide the ability to escape HTML or in the case above, create DOM text nodes from the text. `renderAnnotation` is a generator method that is called for each annotation in the document. When implementing this function, you must `yield` so annotations that are nested under the current one you're working on are surfaced.

We provide some libraries for generating markdown from an AtJSON document, with handlers for each of the types. It provides a way to extend markdown output for more sophisticated use cases, and generating blobs of markdown from a specific annotation.

## How do I use existing documents?

AtJSON documents can be constructed from other sources. A source document is parsed and has annotations added to it, resulting in a normalized AtJSON document.

A markdown document, much like the one being written here, can be represented in AtJSON by annotating the document with the markup.

This can be done using our built-in parser:

```js
import OffsetSource from "@atjson/offset-annotations";
import CommonMarkSource from "@atjson/source-commonmark";

let document = CommonMarkSource.fromRaw("# Hello, world").convertTo(
  OffsetSource
);
```

This will result in the following document:

```js
{
  content: "# Hello, world",
  annotations: [{
    type: "-offset-heading",
    attributes: {
      level: 1
    },
    start: 0,
    end: 14
  }, {
    type: "-atjson-parse-token",
    start: 0,
    end: 2
  }]
}
```

The resulting document in AtJSON is the same as the source document— we take advantage of an internal annotation called a `ParseToken`, which we remove from the document during the output phase.

When rendering the document, text covered by parse tokens will be removed:

```js
{
  content: "Hello, world",
  annotations: [{
    type: "heading",
    attributes: {
      level: 1
    },
    start: 0,
    end: 12
  }]
}
```

## How do I create a new document?

Documents can have annotations and text dynamically added and deleted from them. The APIs for this are designed to be easy-to-use (if they're not, please let us know :sweat_smile:)

```js
import OffsetSource, { Bold } from "@atjson/offset-annotations";

let document = new OffsetSource();
document.insertText(0, "Hello!");
document.addAnnotations(
  new Bold({
    start: 0,
    end: 6,
  })
);

// This should extend the annotation
document.insertText(5, " folks");

// This will remove the text that covers this annotation,
// resulting in an empty document
document.removeText(document.annotations[0]);
```

## Updating Snapshots

When adding or modifying existing code, you might need to create/update snapshots. You can do this by passing the -u flag to Jest. In this case, the following command will update the snapshots:

```sh
npm test -- -u
```

## Contributing

See the guide in [Contributing](CONTRIBUTING.md).

# AtJSON [![Build Status](https://travis-ci.org/CondeNast-Copilot/atjson.svg?branch=latest)](https://travis-ci.org/CondeNast-Copilot/atjson)

AtJSON is a collection of repositories that together make up a fully-realized content format.

| Quick Links |
|-------------|
| [How does a document get rendered?](#how-does-a-document-get-rendered) |
| [How do I use existing documents?](#how-do-i-use-existing-documents) |
| [How do I create a new document?](#how-do-i-create-a-new-document) |

The breakdown of modules in this repository are:

| Modules | Description|
|---------|------------|
| [@atjson/document](packages/document) | AtJSON document and annotation code |
| [@atjson/hir](packages/hir) | HIR (Heirarchical Intermediate Representation) |
| [@atjson/renderer-hir](packages/renderer-hir) | Abstract base class for text-based output |
| [@atjson/renderer-plain-text](packages/renderer-plain-text) | Plain text output |
| [@atjson/renderer-react](packages/renderer-react) | React output |
| [@atjson/renderer-commonmark](packages/renderer-commonmark) | CommonMark output |
| [@atjson/source-commonmark](packages/source-commonmark) | Conversion of CommonMark sources to AtJSON |
| [@atjson/source-html](packages/source-html) | Conversion of HTML sources to AtJSON |


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
    type: "italic",
    start: 4,
    end: 8
  }]
}
```

This document looks like:

> The _best_ writing anywhere, everywhere.

Positions represent the space *in-between* characters in the document. That means an annotation that starts at 0 starts before any character in the document. How the indexing works is as the following:

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
    type: "comment",
    start: 0,
    end: 9
    attributes: {
      author: "Eustace Tilley",
      writtenAt: "2018-01-05 21:00T"
      comment: "What about dog people?"
    }
  }]
}
```

In addition to comments, suggestions can be made to the text in the same manner as comments:

```js
{
  "content": "Reeducation",
  "annotations": [{
    type: "suggested-replacement",
    start: 2,
    end: 3
    attributes: {
      text: "ë",
      author: "Eustace Tilley",
      suggestedAt: "2018-01-10 23:00T"
    }
  }]
}
```

Objects can also be embedded in documents that can be expanded when the document is reified to its final output:

```js
{
  "content": "￼",
  "annotations": [{
    type: "image",
    start: 0,
    end: 1,
    attributes: {
      alt: "Logo",
      url: ""
    }
  }]
}
```


### How does a document get rendered?

We have a source document with annotations:

![War and Peace](https://raw.githubusercontent.com/CondeNast-Copilot/atjson/latest/public/original-document.png)

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
[{
  type: "heading",
  start: 0,
  end: 13,
  attributes: {
    level: 1
  }
}, {
  type: "small-caps",
  start: 38,
  end: 42
}, {
  type: "footnote",
  start: 37,
  end: 478,
  attributes: {
    note: "In the fifth edition of Count Tolstoï's works, this conversation is in a mixture of French and Russian. In the seventh (1887) the Russian entirely replaces the French — N. H. D."
  }
}, {
  type: "italic",
  start: 863,
  end: 869
}, {
  type: "italic",
  start: 911,
  end: 917
}, {
  type: "block-quote",
  start: 1096,
  end: 1324
}, {
  type: "small-caps",
  start: 1308,
  end: 1323
}]
```

This visually would look like:

![War and Peace](https://raw.githubusercontent.com/CondeNast-Copilot/atjson/latest/public/annotated-document.png)

From here, we construct a hierarchical intermediate representation of the content.

![War and Peace](https://raw.githubusercontent.com/CondeNast-Copilot/atjson/latest/public/hir-document.png)

In JSON, this would roughly look like:

```js
{
  type: "document",
  children: [{
    type: "title",
    children: ["War and Peace"]
  }, {
    type: "horizontal-rule",
    children: []
  }, {
    type: "part",
    children: ["Part One"]
  }, {
    type: "chapter",
    children: ["Chapter I."]
  }, {
    type: "paragraph",
    children: ["“", {
      type: "small-caps",
      children: "Well"
    }, ", prince, Genoa and Lucca are now nothing more than apanages, than the private property of the Bonaparte family. I warn you that if you do not tell me we are going to have war, if you still allow yourself to condone all the infamies, all the atrocities of this Antichrist — on my word I believe he is Antichrist — that is the end of acquaintance; you are no longer my friend, you are no longer my faithful slave, as you call yourself.", {
      type: "footnote",
      attributes: {
        note: "In the fifth edition of Count Tolstoï's works, this conversation is in a mixture of French and Russian. In the seventh (1887) the Russian entirely replaces the French — N. H. D."
      }
    }, "Now, be of good courage, I see I frighten you. Come, sit down and tell me all about it.”"
  }, {
    type: "paragraph",
    children: ["It was on a July evening, 1805, that the famous Anna Pavlovna Scherer, maid of honor and confidant of the Empress Maria Feodorovna, thus greeted the influential statesman, Prince Vasili, who was the first to arrive at her reception."]
  }, {
    type: "paragraph",
    children: ["Anna Pavlovna had been coughing for several days; she had the ", {
      type: "italic",
      children: ["grippe"]
    }, ", as she affected to call her influenza — ", {
      type: "italic",
      children: ["grippe"],
    }, " at that time being a new word only occasionally employed."
  }, {
    type: "paragraph",
    children: ["A number of little notes distributed that morning by a footman in red livery had been all couched in the same terms:—"]
  }, {
    type: "paragraph",
    children: [{
      type: "blockquote",
      children: ["“If you have nothing better to do, M. le Comte (or mon Prince), and if the prospect of spending the evening with a poor invalid is not too dismal, I shall be charmed to see you at my house between seven and ten. ", {
        type: "small-caps"
        children: ["Annette Scherer"]
      }, "”"]
    }]
  }, {
    type: "paragraph",
    children: ["“Oh! what a savage attack!” rejoined the prince, as he came forward in his embroidered tourt uniform, stockings, and diamond-buckled shoes, and with an expression of seren—"]
  }]
}
```

This intermediate form allows us to generate output by walking the representation and having a class render the output for that node.

Creating an output is pretty straightforward, and requires no knowledge about the content format. You need to know about the annotations and what attributes they may contain. Generating output based on the hierarchical representation is straightforward and minimal.

Generating an HTML document from a document is all of this code:

```js
import Renderer, { escapeHTML } from '@atjson/renderer-hir';

export default class HTMLOutput extends Renderer {
  renderText(text: string): string {
    return new Text(escapeHTML(text));
  }

  *renderAnnotation(annotation) {
    let element = document.createElement(annotation.type);
    Object.assign(element, annotation.attributes);
    let children = yield;
    for (let child in children) {
      element.appendChild(child);
    }
    return element;
  }
};
```

The `renderText` method is called for every chunk of text in the document, to provide the ability to escape HTML or in the case above, create DOM text nodes from the text. `renderAnnotation` is a generator method that is called for each annotation in the document. When implementing this function, you must `yield` so annotations that are nested under the current one you're working on are surfaced.

We provide some libraries for generating markdown from an AtJSON document, with handlers for each of the types. It provides a way to extend markdown output for more sophisticated use cases, and generating blobs of markdown from a specific annotation.

## How do I use existing documents? 
AtJSON documents can be constructed from other sources. A source document is parsed and has annotations added to it, resulting in a normalized AtJSON document.

A markdown document, much like the one being written here, can be represented in AtJSON by annotating the document with the markup.

This can be done using our built-in parser:

```js
import CommonMarkSource from '@atjson/source-commonmark';

let document = new CommonMarkSource("# Hello, world").toAtJSON();
```

This will result in the following document:

```js
{
  content: "# Hello, world",
  annotations: [{
    type: "heading",
    attributes: {
      level: 1
    },
    start: 0,
    end: 14
  }, {
    type: "parse-token",
    start: 0,
    end: 2
  }]
}
```

The resulting document in AtJSON is the same as the source document— we take advantage of an internal annotation called a `parse-token`, which we remove from the document during the output phase.

When the intermediate representation is created, this document will be altered to look like:

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
import Document from '@atjson/document';

let document = new Document();
document.insertText(0, 'Hello!');
document.addAnnotations({
  type: "bold",
  start: 0,
  end: 6
});

// This should extend the annotation
document.insertText(5, " folks");

// This will remove the text that covers this annotation,
// resulting in an empty document
document.removeText(document.annotations[0]);
```


## Contributing

See the guide in [Contributing](CONTRIBUTING.md).

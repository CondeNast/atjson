# AtJSON [![Build Status](https://travis-ci.com/CondeNast-Copilot/atjson.svg?token=EyGr19LqBpbDaJHnY815&branch=latest)](https://travis-ci.com/CondeNast-Copilot/atjson)

AtJSON is a collection of repositories that together make up a fully-realized content format.

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

![War and Peace](https://github.com/CondeNast-Copilot/atjson/tree/docs/public/tolstoy.png)

This marked up document equates to:

```
War and Peace
Part First
Chapter I.

"Well, prince, Genoa and Lucca are now nothing more than apanages, than the private property of the Bonaparte family. I warn you that if you do not tell me we are going to have war, if you still allow yourself to condone all the infamies, all the atrocities of this Antichrist — on my word I believe he is Antichrist — that is the end of acquaintance; you are no longer my friend, you are no longer my faithful slave, as you call yourself. Now, be of good courage, I see I frighten you. Come, sit down and tell me all about it."

It was on a July evening, 1805, that the famous Anna Pavlovna Scherer, maid of honor and confidant of the Empress Maria Feodorovna, thus greeted the influential statesman, Prince Vasili, who was the first to arrive at her reception.

Anna Pavlovna had been coughing for several days; she had the grippe, as she affected to call her influenza — grippe at that time being a new word only occasionally employed.

A number of little notes distributed that morning by a footman in red livery had been all couched in the same terms:—

"If you have nothing better to do, M. le Comte (or mon Prince), and if the prospect of spending the evening with a poor invalid is not too dismal, I shall be charmed to see you at my house between seven and ten. Annette Scherer"

"Oh! what a savage attack!" rejoined the prince, as he came forward in his embroidered tourt uniform, stockings, and diamond-buckled shoes, and with an expression of seren
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


## Core module

FIXME intro docs here.

[AtJSON](packages/core)

### Internals

HIR (Heirarchical Intermediate Representation): [@atjson/hir](packages/hir)  
Plain Text Renderer: [@atjson/plain-text-renderer](packages/plain-text-renderer)  
CommonMark Renderer: [@atjson/commonmark-renderer](packages/commonmark-renderer)  
React Renderer: [@atjson/react-renderer](packages/react-renderer)  

## Contributing

See the guide in [Contributing](CONTRIBUTING.md).

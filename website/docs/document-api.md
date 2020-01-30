---
title: Document
---

import { Note } from '../src/components/Note.tsx';

Document is the default export of `@atjson/document`. It's used by all atjson packages, and contains the bulk of the APIs you'll use when working with documents.

```ts
import Document from "@atjson/document";
```

<Note>

You need to bring your own `@atjson/document` to your application. We've made `@atjson/document` as a peer dependency to make this clearer for projects that use atjson.

</Note>


## `new`

```ts
let doc = new Document({ content: "Hello, world", annotations: [] });
```

TK

## `addAnnotations`

```ts
let doc = new Document({ content: "Hello, world", annotations: [] });
doc.addAnnotations(new Bold({
  start: 7,
  end: 12
}));
```

`addAnnotations` is used to add annotations to a document. If an annotation is added that doesn't belong to the document schema, it will be turned into an `UnknownAnnotation`.

Annotation instances can be added _or_ annotation JSON objects can be added via this method.

## `addEventListener`

```ts
let doc = new Document({ content: "Hello, world", annotations: [] });
doc.addEventListener("change", () => {
  // Document changed!
});
```

Adds an event listener to the document that will be triggered when the event occurs. Currently, the only supported event is `"change"`.

## `all`

```ts
let doc = HTMLSource.fromRaw("<p>Hello, world</p>");
doc.all();
```

`all` returns a collection of all annotations from the document.

This is a shorthand for `doc.where({})`.

## `canonical`

```ts
let doc = HTMLSource.fromRaw("<p>Hello, world</p>");
doc.canonical();
```

The canonical form of a document is a document stripped of any artifacts from its source input, and with annotations sorted in a stable order.

For an HTML document, the annotated document includes the HTML tags in the source text, but annotated with `ParseAnnotation`s that mark the text as non-significant to the output.

The document above is represented as the following JSON:

export const CanonicalBefore = props => {
  let json = HTMLSource.fromRaw(props.html).toJSON();
  return <pre>
    <CodeBlock className="json">
      {JSON.stringify(json.annotations, null, 2)}
    </CodeBlock>
  </pre>
}

<CanonicalBefore html="<p>Hello, world</p>" />

The canonical form of this document uses the parse tokens as indicators of non-essential text to remove.

export const CanonicalAfter = props => {
  let json = HTMLSource.fromRaw(props.html).canonical().toJSON();
  delete json.schema;
  delete json.contentType;
  return <pre>
    <CodeBlock className="json">
      {JSON.stringify(json, null, 2)}
    </CodeBlock>
  </pre>
}

<CanonicalAfter html="<p>Hello, world</p>" />


<Note>

NOTE: This can occasionally cause slight changes because the source document may have a specific nesting order that becomes ambiguous, like `<u><em>Italic and underlined</em></u>`. In this example, the annotation order will be `em`, then `u` due to alphabetical ordering of the annotations.

</Note>

## `clone`

```ts
let doc = HTMLSource.fromRaw("<p>Hello, world</p>");
let copy = doc.clone();
```

`clone` creates a copy of a document with no references to the original document. Annotation identifiers are the same, but updating an annotation on the cloned document, or the text, will not affect the original document.

## `convertTo`

```ts
let doc = HTMLSource.fromRaw("<p>Hello, world</p>").convertTo(OffsetSource);
```

This will convert a document from one source to another, calling the converter between the two sources.

If a converter isn't defined between the two sources, then an error will be thrown. You will need to then add a converter by following the steps in [Converters](/docs/converters).

## `deleteText`


## `equals`

```ts
let markdown = CommonmarkSource
  .fromRaw("Hello, world")
  .convertTo(OffsetSource);
let html = HTMLSource
  .fromRaw("<p>Hello, world</p>")
  .convertTo(OffsetSource);

markdown.equals(html);
```

`equals` tests that the rendered output of two documents could be considered identical. This doesn't mean that they are identical; it means that the canonical form of both documents result in the same content and annotations.

## `insertText`

default is:

modify should go away?

default:
leading is modified
trailing is preserved

preserve:
leading is preserved
trailing is modified

splice:
leading is preserved
trailing is preserved


## `match`

```ts
let doc = new Document({ content: "foo", annotations: [] });
doc.match(/something/);
```

TK

## `removeAnnotation`

## `replaceAnnotation`

## `removeEventListener`

```ts
let doc = new Document({ content: "Hello, world", annotations: [] });
let handler = () => {};
doc.removeEventListener("change", handler);
```

Removes an existing event listener to the document.

## `slice`

```ts
let doc = HTMLSource.fromRaw("<p>Hello, <em>world</em></p>");
doc.slice(0, 8);
```

`slice` is a way to pull out a fragment of the document out of the original document. It does not remove the text or annotations from the original document.

import HTMLSource from "@atjson/source-html";
import CodeBlock from '@theme/CodeBlock';

export const Slice = props => {
  let json = HTMLSource.fromRaw(props.html).slice(props.start, props.end).toJSON();
  delete json.schema;
  delete json.contentType;
  return <pre>
    <CodeBlock className="json">
      {JSON.stringify(json, null, 2)}
    </CodeBlock>
  </pre>
}

<Slice html="<p>Hello, <em>world</em></p>" start={0} end={8} />

## `where`

```ts
let doc = HTMLSource.fromRaw("<p>Hello, world</p>");
doc.where({ type: "-html-p" });
```

`where` is a querying API on the document that provides a way to manipulate and find annotations in bulk.

## `toJSON`

```ts
let doc = CommonmarkSource.fromRaw("Hello, world");
doc.canonical().toJSON();
```

Returns the JSON form of the document, which includes the `contentType`, `content`, `annotations`, and `schema`. The JSON can then be stored in a database to be used again.

import CommonmarkSource from "@atjson/source-commonmark";

export const ToJSON = props => {
  return <pre>
    <CodeBlock className="json">
      {JSON.stringify(CommonmarkSource.fromRaw(props.markdown).canonical().toJSON(), null, 2)}
    </CodeBlock>
  </pre>
}

<ToJSON markdown="Hello, world"/>

The JSON can be hydrated back into a document by taking the JSON and instantiating a new document from it:

```ts
let doc = new CommonmarkSource(json);
```
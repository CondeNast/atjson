# 🖋 @atjson/document

The Document is the core component of AtJSON. It's a library that provides tools to create annotations and documents, query them, and convert between them. We'll walk through this in this, describing how to use AtJSON.

## 🎴 Introduction to Annotations

Annotations are a term used in both writing and technology. In writing, annotations are marks on a page that is informative. They can be copy-editing notes or shorthand that dictates alterations of text. Software systems use them to add extra contextual information to existing data.

When we mention annotations in AtJSON, we primarily mean the software definition. We are marking up ranges of text that add more meaningful information to the text / document. What makes AtJSON a little different, is how we think of annotations.

Typically when dealing with text, we think of markup languages, like HTML, XML, and markdown. AtJSON can slurp up markup and represent it in terms of annotations. The important feature to note is that it does not distinguish between different types of markup. This is a flexible and powerful foundation, since it allows us to seamlessly convert and manipulate annotations in different formats as if they were the same format.

As an example markdown document like the following:

```md
*Roses* are red,  
*Violets* are blue.
```

Can be parsed into an AtJSON document by passing it into a source in AtJSON. A source is kind of like a parser, but is called a source because they use a parser, and normally we don't do any parsing in a source. Here we use AtJSON's built-in Commonmark source, which is a document format that supports all markdown features specified in the CommonMark spec.

```typescript
import CommonmarkSource from '@atjson/source-commonmark';
 
CommonmarkSource.fromRaw('*Roses* are red,  \n*Violets* are blue.');
```

The result is a logical representation of the markdown document:

```json
{
  "content": "*Roses* are red,  \n*Violets* are blue.",
  "annotations": [{
    "type": "-commonmark-em",
    "start": 0,
    "end": 7,
    "attributes": {}
  }, {
    "type": "-atjson-parse-token",
    "start": 0,
    "end": 1,
    "attributes": {
      "-atjson-reason": "em_open"
    }
  }, {
    "type": "-atjson-parse-token",
    "start": 6,
    "end": 7,
    "attributes": {
      "-atjson-reason": "em_close"
    }
  }, {
    "type": "-commonmark-hard_break",
    "start": 16,
    "end": 19,
    "attributes": {}
  }, {
    "type": "-commonmark-em",
    "start": 20,
    "end": 29,
    "attributes": {}
  }, {
    "type": "-atjson-parse-token",
    "start": 20,
    "end": 21,
    "attributes": {
      "-atjson-reason": "em_open"
    }
  }, {
    "type": "-atjson-parse-token",
    "start": 28,
    "end": 29,
    "attributes": {
      "-atjson-reason": "em_close"
    }
  }]
}
```

**💁‍♀️ Notes**
> AtJSON stores annotations with vendor prefixes. These are meant to prevent collisions between different types of documents.
>
> Positions indicate the position \*between\* characters, not the character boundary. This means `{ start: 0, end: 1 }` is over the first character of the content.

Once the markdown is in AtJSON, we can start modifying the document.

## 📝 Documents

We skipped right to an example of using AtJSON directly, but let's backtrack a bit to explain the other core concept of AtJSON. Annotations can't live in the ether - they need something to latch onto. So we attach them to a Document. A document is the combination of content + annotations. The content, being for our purposes, text, and the annotations being a bunch of information about the text.

Above, the JSON blob is a raw look at the document.

Documents have associated annotation classes that will turn the JSON into a full annotation class that can be accessed without vendor prefixes.

As an intro into documents, let's create a small document definition that describes addresses:

```typescript
import Document, { InlineAnnotation } from '@atjson/document';
 
class Name extends InlineAnnotation {
  static vendorPrefix = 'address';
  static type = 'name';
}
 
class AddressLine extends InlineAnnotation {
  static vendorPrefix = 'address';
  static type = 'line';
}
 
class PostalCode extends InlineAnnotation {
  static vendorPrefix = 'address';
  static type = 'postal-code';
}
 
class City extends InlineAnnotation {
  static vendorPrefix = 'address';
  static type = 'city';
}
 
class Region extends InlineAnnotation {
  static vendorPrefix = 'address';
  static type = 'region';
}
 
class Address extends Document {
  static schema = [Name, AddressLine, PostalCode, City, Region];
}
```

This may seem like a weird example to use, but if we pull up our address for Condé Nast's NYC office:

```
Condé Nast
1 WTC
New York, NY 10006
```

We can start marking this up with some annotations:

```typescript
let address = new Address({
  content: "Condé Nast\n1 WTC\nNew York, NY 10006",
  annotations: []
});
 
address.addAnnotations(
  new Name({ start: 0, end: 10 }),
  new AddressLine({ start: 11, end: 16 }),
  new City({ start: 17, end: 25 }),
  new Region({ start: 27, end: 29 }),
  new PostalCode({ start: 30, end: 35 })
);
```

It seems very arbitrary to store data this way. Why would we do this?

Well, we think this provides the most natural input mechanism for people, while providing robust machine reading capabilities. Documents provide tools that manage annotations so when text is added or removed it "just works" as expected. So, if we wanted to change the text here, and we inserted " Entertainment"  after "Condé Nast", the annotations would remain intact, and in fact, would cover the correct text!

The flexibility here also means that we can render this address out into something more suitable for Google, such as JSONLD. We can use AtJSON's rendering here to take this document and turn it into something that can show a rich location card in search results. Note that in order to do this, we define a rendering rule for every annotation we've defined thus far for our Address schema:

```typescript
import Renderer from '@atjson/renderer-hir';
 
class JSONLDRenderer extends Renderer {
  private jsonld: any;
 
  constructor() {
    this.jsonld = {
      "@context": "https://schema.org",
      "@type": "Place",
      "address": {
        "@type": "PostalAddress"
      }
    };
  }
 
  *Name() {
    let name = yield;
    this.jsonld.name = name.join('');
  }
 
  *AddressLine() {
    let streetAddress = yield;
    this.jsonld.address.streetAddress = streetAddress.join('');
  }
 
  *City() {
    let addressLocality = yield;
    this.jsonld.address.addressLocality = addressLocality.join('');
  }
 
  *Region() {
    let addressRegion = yield;
    this.jsonld.address.addressRegion = addressRegion.join('');
  }
 
  *PostalCode() {
    let postalCode = yield;
    this.jsonld.address.postalCode = postalCode.join('');
  }
 
  *root() {
    yield;
    return this.jsonld;
  }
}
```

Sending the document that we created through this would result in a JSON-LD object:

```json
{
  "@context": "https://schema.org",
  "@type": "Place",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "New York",
    "addressRegion": "NY",
    "postalCode": "10006"
  },
  "name": "Condé Nast"
}
```

This was a bit of a whirlwind, but we think it provides a good example of ways that you can start thinking about how to use annotations!

**💁‍♀️ Notes**
> We call a defined document schema a "source". They're not exactly parsers, since they represent the content in AtJSON in that format. I like to think of them like a source that a journalist has, where they collect information from that source and use it in their reporting.

## 🔍 How to find data in a document
Annotations in AtJSON can be treated like a little database. It's a little like how jQuery suddenly opened up the possibilities of what could be done on websites because you could do simple and elegant manipulation.

There's 2 levels of querying for documents. The first is partial matches:

```typescript
doc.where({ type: '-offset-link' });
```

This query will find all links in a document

**💁‍♀️ Notes**
> The partial match query language requires vendor prefixes

The equivalent version of this using the function syntax would be:

```typescript
import { Link } from '@atjson/offset-annotations';
 
doc.where(annotation => annotation instanceof Link);
```


**💁‍♀️ Notes**
> The function syntax returns hydrated annotations. You may encounter Unknown annotations here, which are annotations that are unsupported by the document schema. Be careful! 👹

### 👹A note about Unknown Annotations

AtJSON never deletes or drops data. Instead, it isn't supported or understood by a document. If a feature becomes discontinued, or is migrated from a legacy system, we can choose to ignore this, while retaining the data.

This data is stored as unknown annotations, which are an annotation that stores all the annotation information in the attributes hash. When serialized to JSON, they look like the original annotation, but when rendering they are ignored.

```json
{
  "type": "-html-marquee",
  "start": 0,
  "left": 10,
  "attributes": {
    "-html-style": "rainbow"
  }
}
```
 
Turns into:

```typescript 
new UnknownAnnotation({
  start: 0,
  end: 10,
  attributes: {
    type: '-html-marquee',
    attributes: {
      '-html-style': 'rainbow'
    }
  }
})
```

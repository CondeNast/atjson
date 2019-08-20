---
title: Document
---

## Canonical
```js
document.canonical();
```
Return the canonical form of a document by sorting its annotations by position and type as well as stripping parse tokens.

## Equals
```js
document.equals(documentToCompare);
```
Returns true if documents are equal. Equals() calls canonical on each document to compare, and then compares each document's content + annotations.


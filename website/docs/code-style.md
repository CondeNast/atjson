---
title: Code Style
---

The repo runs Prettier on a pre-commit hook, so most issues of code style are applied automatically. However, there are a few manual considerations that should be made when contributing which allow for better code analysis--and often increased performance.

## Always name functions

We use the names of functions in our performance analysis tools. All anonymous functions appear in a single section under `(anonymous)` which makes it impossible to tell if any particular function is behaving badly.

**BAD**:

```ts
doc.where({ type: "-vendor-type" }).update(annotation => {
  doc.removeAnnotation(annotation);
});
```

**GOOD**:

```ts
doc
  .where({ type: "-vendor-type" })
  .update(function removeAnnotation(annotation) {
    doc.removeAnnotation(annotation);
  });
```

**GOOD**:

```ts
// the assignment statement gives this arrow function the name `removeAnnotation`
let removeAnnotation = annotation => {
  doc.removeAnnotation(annotation);
};

doc.where({ type: "-vendor-type" }).update(removeAnnotation);
```

## Avoid function expressions

Declare functions as statements in the outermost possible scope. Typically this would be immediately after any closed-over variables are declared. This prevents unnecessary re-construction of the function and naturally forces the function to be named.

**BAD**:

```ts
let start = document.length - 1;
let _s = start;

while (start > 0 && _s !== start) {
  start = Math.max(...document.where((annotation) => annotation.start < start).annotations))
}
```

**GOOD**:

```ts
let start = document.length - 1;
let _s = start;

// The assignment statement gives this arrow function the name `beforeStart`
let beforeStart = (annotation) => annotation.start < start

while (start > 0 && _s !== start) {
  start = Math.max(...document.where(beforeStart).annotations))
}
```

**GOOD**:

```ts
let start = document.length - 1;
let _s = start;

function beforeStart(annotation) {
  return annotation.start < start;
}

while (start > 0 && _s !== start) {
  start = Math.max(...document.where(beforeStart).annotations))
}
```

## Prefer `for` loops

One common use for an anonymous function is as the argument to one of the functional `Array` APIs. `Array.map` and `Array.filter` may have some advantages for memory allocation, but `Array.forEach` and `Array.reduce` can almost always be straightforwardly replaced with a `for-of` or `for-in` loop. Unless the function argument is an already-existing function, use a `for` loop.

**GOOD**, since the argument to forEach is `deleteParseArtifacts`, a function that already exists:

```ts
function deleteParseArtifacts(doc: Document): undefined {
  ...
}

deleteParseArtifacts(thisDoc);
...
documents.forEach(deleteParseArtifacts);
```

**BAD**:

```ts
Object.keys(attributes).reduce((flatAttrs, key) => {
  return flatAttrs + ` ${key}=${attributes[key]}`;
}, "");
```

**GOOD**:

```ts
let flatAttrs = "";
for (let key in attributes) {
  flatAttrs += ` ${key}=${attributes[key]}`;
}
```

**BAD**:

```ts
annotations.forEach(annotation => {
  newDoc.insertAnnotation(annotation);
});
```

**GOOD**:

```ts
for (let annotation of annotations) {
  newDoc.insertAnnotation(annotation);
}
```

## Prefer `for-of` and `for-in`

For readability, avoid C-style `for` loops (like `for (var i=0; i < length; i++)`) when you are simply iterating over an array from front to back. We have found no significant difference in performance in using C-style loops as opposed to `for-of` and `for-in`.

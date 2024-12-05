# @atjson/peritext

Functions for creating and manipulating peritext documents directly. The construction functions `mark`, `block`, and `concat` are useful for creating properly-nested documents of the sort that appear in XML-like structures. Peritext documents can of course in general have structures where marks overlap each other in arbitrary ways, but this library doesn't provide explicit means to do so.

A typical case of creating a document might look like

```typescript
let doc = concat(
  block(Paragraph, { decorations: ["drop-cap"] }, "My introductory paragraph"),
  block(HorizontalRule, {}).set("selfClosing", true),
  block(Paragraph, {}, ["My", mark(Italic, {}, "fancy"), "body paragraph"])
);
```

## PeritextBuilderStep

For convenience, several of the functions in this library (particularly `block`, `mark`, and `slice`) return a `PeritextBuilderStep` instead of just a regular peritext document. A `PeritextBuilderStep` _is_ a peritext document, but when it's created it has an extra value attached to it representing the immediate product of the builder function. This value can be accessed with the `getValue()` method on the `PeritextBuilderStep`:

```typescript
let paragraph: PeritextBuilderStep<Block>;

let doc = block(Div, {}, (paragraph = block(Paragraph, {}, "Hello!")));

return insertBefore(doc, paragraph.getValue().id, HorizontalRule, {});
```

## Mutation

All of the functions that construct and modify documents have the property that they shallowly copy any _peritext documents_ in their arguments, but **directly mutate** any _blocks_ and _marks_ on that document. This potentially-surprising behavior is intentional: this way, one can store the results of intermediate build steps and any such references to marks and blocks in the document will remain accurate after applying further build steps. documents are shallowly-copied in order for the behavior of functions like `concat` (which take multiple document objects and so could only mutate one of them anyway) to be consistent with the behavior of functions like `groupChildren` (which could in principle simply mutate the input document directly)

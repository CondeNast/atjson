---
title: React
---

atjson has a package for rendering documents into React. The renderer gives you complete control how each annotation is renderered.

## Getting Started

Install the React renderer using `npm`:

```bash
npm install --save @atjson/renderer-react
```

import { Note } from '../src/components/Note.tsx';

<Note>

We're writing our components in TypeScript here to take advantage
of type propagation from annotations to React components. You can
use whatever language that compiles down to Javascript that is
most comfortable for you.

</Note>

After installation, let's prepare a React component for the renderer to use. Here's a basic React component that we'll use to render `Bold` annotations:

```ts
const BoldComponent: FC<{}> = props => <strong>{props.children}</strong>;
```

Now let's use that component when rendering an atjson document into React components. The React renderer must be wrapped in the provided `ReactRendererProvider` context component, which is used to provide a map of the components available to the renderer.

```ts
import * as React from "react";
import { FC } from "react";
import ReactRenderer, { ReactRendererProvider } from "@atjson/renderer-react";

export const Story: FC<{ children: Document }> = props => {
  const components = {
    Bold: BoldComponent
  };

  return (
    <ReactRendererProvider value={components}>
      {ReactRenderer.render(props.children)}
    </ReactRendererProvider>
  );
};
```

In the example above, any time the React renderer encounters a `Bold` annotation, it will render it using the `BoldComponent` we've created!

## Using annotation attributes

In the example above, the `BoldComponent` simply wraps the annotation text in an HTML tag, but more complex annotations may have additional attributes that you can use when rendering. The renderer provides any values within an annotation's `attributes` as `props` to the rendering component. Here's an example of a component that renders an `IframeEmbed` annotation, which has many attributes that can affect how it renders.

```ts
import { IframeEmbed } from "@atjson/offset-annotations";

const IframeComponent: FC<AttributesOf<IframeEmbed>> = props => (
  <figure>
    <iframe width={props.width} height={props.height} src={props.url} />
    <figcaption>{props.caption}</figcaption>
  </figure>
);
```

In this example, all the props provided are attributes that belong to the `IframeEmbed` annotation within a document.

## The component map

The component map is an object whose keys should correlate to the annotation types in your atjson document. The renderer will look for keys that either match the annotation type or the result of calling `classify` on the annotation type (which removes hyphens and capitalizes the words in the type name). For example, you may use either `iframe-embed` or `IframeEmbed` as the key for an `IframeEmbed` annotation.

The value for any given annotation key is the React component you intend to use to render that annotation. If the renderer encounters an annotation with no key present in the map, it simply returns the text for that annotation with no decoration.

Using our previous example components, here's how we'd render a document which contains `Bold` and `IframeEmbed` annotations:

```ts
import * as React from "react";
import { FC } from "react";
import ReactRenderer, { ReactRendererProvider } from "@atjson/renderer-react";

// the component map, using the BoldComponent and IframeComponent from above
const components = {
  Bold: BoldComponent,
  IframeEmbed: IframeComponent
};

export const Story: FC<{ children: Document }> = props => (
  <ReactRendererProvider value={components}>
    {ReactRenderer.render(props.children)}
  </ReactRendererProvider>
);
```

## Alternate contextual rendering

By default, the component map provided to the `ReactRenderer.render` call will be used to render the entire document, including any subdocuments (captions, etc). If, however, you need to change the rendering of a particular annotation within a specific context, for example, to render an alternate `Bold` component when it is nested within a `Caption` annotation, you can utilize the `ReactRendererProvider` within your components to override particular components within your component map for that context. For example:

```ts
// a contextual caption bold component
const CaptionBoldComponent = FC<{}> = props => {
  return <b><{props.children}</b>;
};

// an iframe component using the contextual override
const IframeComponent: FC<AttributesOf<IframeEmbed>> = props => {
  return (
    <figure>
      <iframe src={props.url} />
      <ReactRendererProvider value={{ Bold: CaptionBoldComponent }}>
        <figcaption>{props.caption}</figcaption>
      </ReactRendererProvider>
    </figure>
  );
};

// top-level component map
const components = {
  IframeEmbed: IframeComponent
  Bold: BoldComponent
}

// top-level component render
<ReactRendererProvider value={components}>
  {ReactRenderer.render(doc)}
</ReactRendererProvider>
```

In this instance, the renderer would call the `CaptionBoldComponent` whenever a `Bold` annotation appears within the iframe caption, but any `Bold` annotation outside of that context would still use the parent-level `BoldComponent`.

**Note:** Nested usages of `ReactRendererProvider` are merged with the parent component map; the renderer does not completely replace the parent component map. You only need to provide a component map for the annotations that you wish to override.

## API

### `ReactRenderer.render()`

```ts
ReactRenderer.render(document);
```

A static rendering function that will walk the provided document, rendering annotations as React components based on the component map provided via the `ReactRendererProvider`.

### `ReactRendererProvider`

```ts
<ReactRendererProvider value={components}>
  {...}
</ReactRendererProvider>
```

A thin wrapper around React context that provides, via the `value` prop, the map of components `ReactRenderer.render` uses. Nested instances of `ReactRendererProvider` merge the provided component map value with any component maps higher in the component tree.

### `ReactRendererConsumer`

```ts
<ReactRendererConsumer>
  { value => ... }
</ReactRendererConsumer>
```

The React context consumer whose `value` is the component map.

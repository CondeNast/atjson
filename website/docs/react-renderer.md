---
title: React
---

atjson has a package for rendering documents into React. The renderer
gives you complete control how each annotation is renderered.

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


```ts
import * as React from 'react';
import { FC } from 'react';
import ReactRenderer from '@atjson/renderer-react';

export const Story: FC<{ children: Document }> = props => {
  return ReactRenderer.render(props.children, components);
};
```

## API

### `ReactRenderer.render()`

```ts
ReactRenderer.render(document, components);
```

TK explain render function

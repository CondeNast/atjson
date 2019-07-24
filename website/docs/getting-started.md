---
title: 🐣 Getting Started
---

atjson is a toolchain for manipulating, querying, and verifying content.
The core of atjson is extensible, and it's completely up to you how you'd
like to model your content.

import { Note } from '../src/components/Note.tsx';

<Note>

**Note**: atjson is made up of a bunch of packages. Think of these as
building blocks that you can use. The main package is `@atjson/document`,
which is the fulcrum of the toolchain.

</Note>

## An Extensible Interchange Format

atjson decouples *content* from *semantics*. Take the sentence,
the quick brown fox jumps over the lazy dog. If we were to break down
the sentence into its linguistic parts, we start seeing relationships
between parts of the sentence and overlapping linguistic meaning.

import { Adjective, Noun, Image, Italic, QuickBrownFox, QuickBrownFoxSource, TextColor, Verb } from '../src/components/QuickBrownFox.tsx';

<QuickBrownFox value={
  new QuickBrownFoxSource({
    content: 'The quick brown fox jumped over the lazy dog.',
    annotations: [new Adjective({
      start: 4,
      end: 15
    }), new Italic({
      start: 4,
      end: 9
    }), new TextColor({
      start: 10,
      end: 15,
      attributes: { color: '#9b2b2b' }
    }), new Noun({
      start: 16,
      end: 19
    }), new Image({
      start: 10,
      end: 19
    }), new Verb({
      start: 20,
      end: 26
    })]
  })
} />

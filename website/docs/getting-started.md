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
      end: 15,
      attributes: { name: 'adjective' }
    }), new Italic({
      start: 4,
      end: 9
    }), new TextColor({
      start: 10,
      end: 15,
      attributes: { color: '#9b2b2b' }
    }), new Noun({
      start: 16,
      end: 19,
      attributes: { name: 'noun' }
    }), new Image({
      start: 10,
      end: 19,
      attributes: { src: 'https://cdn.pixabay.com/photo/2018/03/11/20/42/mammals-3218028_960_720.jpg' }
    }), new Verb({
      start: 20,
      end: 26,
      attributes: { name: 'verb' }
    }), new Adjective({
      start: 36,
      end: 40,
      attributes: { name: 'adjective' }
    }), new Image({
      start: 36,
      end: 44,
      attributes: { src: 'https://media.giphy.com/media/gdUxfKtxSxqtq/200w_d.gif' }
    })]
  })
} />

TK TK
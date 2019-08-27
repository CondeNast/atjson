---
title: Structure
---

An atjson document has the content, and the annotations. Annotations are
data about the content, and have `start` and `end` positions that refer
to positional offsets in the document.

## Content

TK

## Annotations

TK

### About Offsets

Positions represent the space *in between* characters in the document.
That means an annotation that starts at `0` starts before any character in the document.

import { CharacterOffsetViewer } from '../src/components/CharacterOffsetViewer.tsx';

<CharacterOffsetViewer>Hello</CharacterOffsetViewer>

Some characters are made up of multiple bytes, which means multiple positions may be mapped
to seemingly the same character:

<CharacterOffsetViewer>👋</CharacterOffsetViewer>

This is because `👋` is made up of two bytes. Some characters have
diacritics or joining characters, so there's the possibility of many
characters that span over a single selectable letter, like this family:

<CharacterOffsetViewer>👩‍👩‍👧</CharacterOffsetViewer>

Or a [diaeresis](https://www.newyorker.com/culture/culture-desk/the-curse-of-the-diaeresis):

<CharacterOffsetViewer>coöperate</CharacterOffsetViewer>

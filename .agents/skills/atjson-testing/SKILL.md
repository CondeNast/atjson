---
name: atjson-testing
description: Add and run regression tests for AtJSON document primitives, annotation schemas, parsers and renderers, and verify affected consumer boundaries.
---

# Test AtJSON features

Read [AGENTS.md](../../../AGENTS.md) and the
[development skill](../atjson-development/SKILL.md). Reuse any verified local task
reference before selecting checkouts; standalone contributions use this public
repository's own guidance. Inspect actual imports and exported types to choose
assertions. Read [runner details](references/test-workflows.md) before execution.

## Owning suites

| Contract                      | Existing location and focus                                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document and annotations      | `packages/@atjson/document/test/`: edits, ranges, queries, equality, stable IDs, serialization, slices and conversion registration                                              |
| Shared schema                 | `packages/@atjson/offset-annotations/test/`: annotation semantics, URLs and aspect ratios; extend affected parser/renderer cases too                                            |
| HTML and CommonMark           | `source-html`, `source-commonmark`, `renderer-html`, `renderer-commonmark` package tests: attributes, escaping, marks, blocks and output syntax                                 |
| Other sources                 | `source-url`, `source-gdocs-paste`, `source-ckeditor`, `source-mobiledoc`, `source-prism`, `source-wordpress-shortcode` package tests: conversion-specific content and metadata |
| Shared rendering              | `renderer-hir`, `hir`, `util`, `peritext`, `react` and other renderer tests: tree/slice structure and output                                                                    |
| Multiple-package preservation | Root `tests/` and `tests/fixtures/`: parse → convert → render → parse contracts                                                                                                 |

## Meaningful assertions

- Pair round-trip equality with independently expected text, types, ranges,
  attributes and nesting. Both conversion directions can lose the same data.
  `expect(value)` without a matcher does not assert anything.
- Use stable IDs where incidental; retain exact syntax, escaping and significant
  whitespace where contractual. Cover relevant empty/adjacent/nested marks,
  Unicode, slice references, unknown annotations, malformed input and options.
- Reuse small public or synthetic fixtures. Do not copy private content or update
  snapshots merely to accept a discrepancy. Demonstrate the semantic failure
  before a regression fix and its passing result afterward where practicable.
- Verify normal discovery and nonzero execution; inspect focused/skipped cases.
  Broaden shared document/schema changes through affected sources and renderers.
- Follow the [HTML preservation guide](../../../tests/README.md) and its exact,
  expiring known-failure registry. Required cases execute; changed signatures,
  unexpected fixes and expired records need review. Affected failures cannot be
  reclassified as unrelated exceptions.

## Coverage limits

Source-mapped Jest results establish library behavior, not installed artifact
identity. Inspect actual builds, packed contents and consumer resolution before
claiming package integration; adjacent source checkouts are insufficient.
`source-ckeditor` jsdom checks do not prove real-browser layout or a downstream
application's persistence. Report those limits and unrun affected consumer checks.
Keep private consumer requirements and results outside this public repository.

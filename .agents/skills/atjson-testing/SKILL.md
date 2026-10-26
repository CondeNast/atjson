---
name: atjson-testing
description: Add and run regression tests for AtJSON document primitives, annotation schemas, parsers and renderers, and verify affected consumer boundaries.
---

# Test AtJSON features

Read [AGENTS.md](../../../AGENTS.md) and the
[AtJSON development skill](../atjson-development/SKILL.md). Reuse the optional
local task reference and its verified checkout mappings when present. Without
one, use this repository's public contribution workflow. Never infer another
repository's path or identity from a sibling directory name. Keep downstream
coordination details in their existing local task storage, not public files.

Read the [execution and evidence workflow](references/test-evidence.md) before
running tests and [behavior discovery guidance](references/feature-testing.md)
when defining missing assertions. Delegated testing adds relevant test files,
synthetic fixtures and reviewed snapshots; permanent product changes, dependency
preparation and delivery belong to the authorized development workflow. Existing
runner caches and evidence are permitted in bounded ignored or temporary task
locations. Reuse applicable authorization rather than requesting it again for
the same scope. Do not start a second task or delivery process.

Verify the repository and selected revision before a run. Test edits and local
implementation probes require the task's implementation branch. Checks without
source edits may use unchanged consumers on a default branch and prepared pinned
detached candidate/baseline checkouts. Preserve unrelated work. Only the exactly
restored candidate and intended tests may pass to delivery; agents never merge.

## Choose the owning tests

Trace actual imports, exported types and callers before choosing downstream
checks. This repository owns the public `@atjson/*` workspace.

| Contract                       | Existing test location and focus                                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Document and annotations       | `packages/@atjson/document/test/`: insert/delete, ranges, queries, equality, stable IDs, serialization/deserialization, slices and conversion registration                     |
| Shared offset schema           | `packages/@atjson/offset-annotations/test/`: dataset/annotation semantics, social/video URLs and aspect ratios; extend affected parser/renderer cases too                      |
| HTML and CommonMark            | `source-html`, `source-commonmark`, `renderer-html`, `renderer-commonmark` package `test/` directories: attributes/ranges, escaping, marks, blocks, embeds and output syntax   |
| Other input adapters           | `source-url`, `source-gdocs-paste`, `source-ckeditor`, `source-mobiledoc`, `source-prism`, `source-wordpress-shortcode` package tests: conversion-specific inputs and metadata |
| Rendering and shared structure | `renderer-hir`, `hir`, `util`, `peritext`, `react` and other renderer package tests: tree/slice structure and rendered output                                                  |
| Multiple-package preservation  | Root `tests/` and `tests/fixtures/`: parser → annotation conversion → renderer → parser contracts                                                                              |

Use [runner details and examples](references/test-workflows.md) for commands and
limitations. A source-mapped Jest pass proves local library behavior; it does not
establish that a consumer installed the candidate package artifact.

## Derive assertions from the feature

1. Read the request, complete feature diff, specification, adjacent behavior and
   actual matchers. Map each required behavior to an assertion. Reuse adequate
   tests; run the affected existing tests before adding coverage when possible.
2. Assert independently expected text, annotation types, ranges, attributes,
   nesting and metadata. Pair round-trip equality with concrete values: both
   directions can agree while losing the same information. Use stable IDs when
   identifiers are incidental. Preserve exact syntax/escaping assertions where
   they are the contract, and document permitted normalization.
3. Select relevant empty, adjacent, nested and overlapping marks; whitespace and
   Unicode; slice references; captions and layouts; unknown annotations;
   malformed input; and parser options. Use small public or synthetic fixtures.
   Never copy private content or refresh snapshots merely to accept a defect.
4. For regressions, use prepared before/after revisions or a focused sensitivity
   probe under the [restoration protocol](references/feature-testing.md#demonstrate-the-test-detects-incorrect-behavior).
   Require the intended semantic assertion to fail, then pass on the restored
   candidate. Setup/import failures do not demonstrate assertion sensitivity.
5. Execute the relevant suites. Confirm normal discovery, nonzero execution and
   absence of accidental focus/skip filters. Distinguish execution from builds,
   discovered files, snapshot changes and setup failures. Shared schema changes
   require affected source/renderer and consumer checks beyond the edited file.

## Validate consumer boundaries

Follow the task's actual dependency graph, including direct consumers and peers.
Use its verified checkout mappings and selected revisions to load each affected
consumer's current instructions. If no mapping is available, resolve repository
identity and intended checkout before consumer work; do not guess a sibling path.
Keep private consumer requirements and reports outside this public repository.

Verify prepared builds, packed contents, installed package paths and versions
before claiming integration coverage. Source aliases, neighboring checkouts and
unchanged version strings do not establish artifact provenance. Pass missing or
stale build/install prerequisites to development; continue independent checks.
Do not edit an unchanged consumer simply to create a branch or PR.

Library and jsdom tests cannot prove real-browser appearance or live persistence.
Use the affected consumer's approved browser checks when those behaviors are in
scope. Distinguish a controlled backend's frontend preservation evidence from
live-service persistence; neither substitutes for the other. Report unexecuted
required checks explicitly, without expanding into an unapproved service action.

## Return useful results

Return test/fixture paths, expected behaviors, commands, working directories,
revision/artifact identities, executed counts, failures/skips and unvalidated
consumers to the existing task. Preserve required runner outputs and verification
receipts in its approved ignored/temporary locations. Conversation summaries
explain results and do not replace executable evidence. Keep private task details
out of public reports, commits and PRs. Continue independent available checks
when another is blocked and state what remains unresolved.

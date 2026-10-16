---
name: atjson-testing
description: Add and run regression tests for developed features in foundational AtJSON packages, including document primitives, annotation schemas, parsers, renderers and affected consumers. Feed results into the existing development workflow and feature PR.
---

# Test foundational AtJSON features

Read this repository's `AGENTS.md`, the [shared testing workflow](references/test-evidence.md),
and [behavior discovery guidance](references/feature-testing.md). This skill's
lasting edits are relevant test files, synthetic fixtures and reviewed test
snapshots for the developed feature. Temporary implementation mutations are
allowed only under the focused sensitivity protocol below. Read configuration
without changing it; delegate missing
dependencies, builds, runner configuration and credential setup to development
or the user. Do not retain product code changes or edit manifests, scripts,
documentation or credential files. Identify product defects and return them to the development
workstream instead of silently changing production behavior. Review the full
feature branch against its intended base, not just the latest commit, and
preserve unrelated local changes.

Before any edit or test run, verify every owning checkout matches the active
task's existing feature branch. Never edit or test on `main`, `master`, the
repository's default branch or detached HEAD. If the branch is wrong or unknown,
stop that repository's work and ask the coordinator to prepare the correct task
branch; do not switch or create branches.

When the development workflow's `copilot-package` adapter is present, reuse its
resolved task, checkouts and branches. Supply coverage and execution results to
the coordinator's existing `copilot-test` workflow. `copilot-delivery` owns the
combined feature-and-tests PR in each changed repository; do not create another
test-only PR. Testing never stages, commits, pushes, publishes or merges changes.
Delivery may receive only the restored candidate and intended tests under its
separate authorization.
Return results in the conversation and existing feature PR handoff. Do not create
standalone reports, evidence JSON, task records or workspace scaffolding inside
or outside the repository. Inspect the selected runner and test hooks before
execution. Do not run commands with unsupported writes, output outside the
repository/workspace or external/shared-service effects. Delegate those checks
to the coordinator under the shared authorization workflow and state the gap.

## Choose the owning tests

`atjson` owns `@atjson/*`, not Copilot's `@condenast/atjson-*` extensions. Trace the
changed package's imports, exported types and callers before deciding which
downstream suites are affected.

| Contract                       | Existing test location and focus                                                                                                                                                    |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document and annotations       | `packages/@atjson/document/test/`: insert/delete, ranges, queries, equality, stable IDs, serialization/deserialization, slices and conversion registration                          |
| Shared offset schema           | `packages/@atjson/offset-annotations/test/`: dataset/annotation semantics, social/video URLs and aspect ratios; extend affected parser/renderer cases too                           |
| HTML and CommonMark            | `source-html`, `source-commonmark`, `renderer-html`, `renderer-commonmark` package `test/` directories; parsed attributes/ranges, escaping, marks, blocks, embeds and output syntax |
| Other input adapters           | `source-url`, `source-gdocs-paste`, `source-ckeditor`, `source-mobiledoc`, `source-prism`, `source-wordpress-shortcode` package tests; conversion-specific inputs and metadata      |
| Rendering and shared structure | `renderer-hir`, `hir`, `util`, `peritext`, `react` and other renderer package tests; tree/slice structure and rendered output                                                       |
| Multiple-package preservation  | Root `tests/` and `tests/fixtures/`; parser → annotation conversion → renderer → parser contracts                                                                                   |

Use [runner details and examples](references/test-workflows.md) for exact commands
and known limitations. A source-mapped Jest pass proves local library behavior;
it does not establish that a consuming application installed that candidate.

## Derive assertions from the feature

1. Read the request, relevant specification, full diff, adjacent behavior and
   actual matchers. Map each important expected behavior to an owning assertion.
   Identify missing cases even when they were not requested explicitly. Run the
   affected existing tests before adding coverage when setup permits, then extend
   their established harnesses.
2. Assert independently expected text, annotation types, ranges, attributes,
   nesting and metadata. Pair round-trip equality with concrete expected values;
   two conversions can agree while omitting the same information. Use stable IDs
   where identifiers are incidental. Preserve exact output assertions when HTML,
   Markdown or escaping is the contract, and explain accepted normalization.
3. Select relevant edge cases: empty/adjacent/nested or overlapping marks,
   whitespace and Unicode, slice references, embed captions and layouts, unknown
   annotations, malformed input, and supported parser options. Reuse small
   synthetic fixtures. Do not copy private editorial content or refresh snapshots
   merely to accept a discrepancy.
4. For a regression, use an already prepared before/after comparison supplied by
   development where available. A focused temporary local implementation mutation
   may challenge an assertion on the verified task feature branch. Preserve exact
   pre-probe contents in memory, including user edits; first establish a passing
   baseline, then require the intended semantic assertion to fail. Restore those
   exact contents, verify the diff and rerun the affected checks before handoff.
   Detect concurrent changes before restoration and stop for coordination rather
   than overwriting them. Never use reset/stash, temporary copies/checkouts,
   installed-package replacement or a permanent product fix for this probe.
   Never stage, commit, push or publish the mutant. Follow the
   [shared sensitivity protocol](references/feature-testing.md#demonstrate-the-test-detects-incorrect-behavior).
   If sensitivity was not established, say so; setup/import failures do not prove
   that a semantic assertion detects the defect.
5. Execute the updated relevant suites. Verify actual discovery when adding a
   file or changing selectors; require nonzero executed cases and inspect focused
   or skipped blocks. Separate executed assertions from discovered files,
   snapshots updated, setup errors and flaky results. For
   shared document/schema changes, broaden through affected source/renderer
   packages and identified consumers rather than testing only the edited file.

## Validate consumer boundaries

Foundational changes can reach the other repositories by several paths:

- [Copilot AtJSON](../copilot-atjson-testing/SKILL.md) uses document/offset,
  CommonMark and renderer primitives for Copilot Markdown and Verso. Add coverage
  there when those extension semantics can change.
- [CKEditor](../ckeditor-testing/SKILL.md) extends upstream CKEditor/HTML sources
  and HTML rendering. Its custom plugins and converters have their own tests;
  upstream `source-ckeditor` does not replace them.
- [Copilot App](../copilot-app-testing/SKILL.md) also imports upstream AtJSON
  packages directly. Inspect direct dependencies as well as paths through the
  editor and Copilot-specific converters.
- [Copilot Automation](../copilot-automation-testing/SKILL.md) owns maintained
  browser journeys when changed semantics must survive editing and save/reload.

Read each affected consumer's current instructions and native testing skill.
Inspect candidate build/install information supplied by development and verify
resolved package paths and versions without modifying dependencies before claiming
integration coverage. Delegate missing or stale builds/installations to development. The
sibling source tree and unchanged version strings do not establish provenance.
Do not change another repository simply because it exists; state why unaffected
boundaries need no new assertions.

Library tests, including jsdom editor tests, cannot detect the app toolbar's
visible active styling or prove Content Platform persistence. Those require
the appropriate consumer's authorized real-browser assertions. Write relevant
browser tests in the owning repository and return any unexecuted service checks
to the coordinator. A formatting feature may
need no new upstream AtJSON test if its core content contract is unchanged.

## Return useful results

Give the development coordinator the changed tests/fixtures, expected behaviors,
actual commands and working directories, candidate identities, executed counts,
failures/skips, and any unvalidated consumers. Explain whether the evidence
supports the feature and what remains unresolved. Continue independent available
checks when another is blocked. Keep these results with the existing feature
discussion/PR rather than starting a parallel reporting or delivery workflow.

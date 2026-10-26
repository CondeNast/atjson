# AtJSON runners and assertion examples

Selections below belong to the upstream `atjson` root. Before any edit or run,
verify this is the active task's existing feature branch, never `main`, `master`,
the default branch or detached HEAD. Ask the coordinator to prepare a wrong or
unknown branch; do not switch or create it. Read current `.nvmrc`,
`package.json`, `babel.config.js`, affected package manifests and
`.github/workflows/ci.yml` first. This checkout declares Node 22.15.0; root npm
engines are not pinned. Use the repository's runtime, not another checkout's.
Ask development or the user to prepare missing runtimes/dependencies; do not
install packages or edit setup/configuration files from this testing skill.

Root `npm test` runs the local Jest binary. Its `moduleNameMapper` maps
`^(@atjson/.*)$` to `packages/$1/src/index.ts`; Babel handles TypeScript/JSX, and
CKEditor JavaScript is exempted from the transform-ignore rule. The root config
does not narrow default Jest discovery with `testMatch` or `testRegex`.
Package tests generally live in `packages/@atjson/<package>/test/*.test.ts[x]`;
root `tests/` contains integration cases. Run through root Jest: package manifests
do not uniformly declare test/build scripts, despite older contributing guidance.
Inspect the selected suites, hooks and reporters for writes and network effects
before running them. The installed Jest runner writes cache/transform data, by
default in a system temporary directory; `--no-cache` does not make it write-free.
Do not invoke that default runner from this restricted testing skill. Give the
coordinator the selected tests for separately authorized execution, and mark them
not run until actual results return. Do not create a cache directory, modify
configuration or redirect results into new files to bypass this boundary.

Selection examples for that handoff (not commands to execute):

| Purpose                  | Existing files to pass through Jest's `--runTestsByPath`                                                 |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| HTML parsing/rendering   | `packages/@atjson/source-html/test/bold.test.ts`, `packages/@atjson/renderer-html/test/encoding.test.ts` |
| Shared document behavior | `packages/@atjson/document/test/serialize.test.ts`, `packages/@atjson/document/test/equals.test.ts`      |

Ask for discovery and assertion execution separately. `--listTests` discovers
files and does not run their assertions; `--ci` prevents automatic snapshot
updates. Those options do not authorize or eliminate the runner's file writes.

The focused pair above illustrates test selection, not sufficient coverage for
every formatting feature. Preserve the actual selector/config when diagnosing
omitted tests. Discovery is not a test result. No JSON output or report directory
should be added for this workflow; return the actual results to development.

The native skill permits temporary local implementation mutations for focused
sensitivity checks only on that verified feature branch. Preserve exact original
contents in memory, establish pass → intended assertion failure → exact restore
→ passing rerun, and verify the diff. Do not overwrite concurrent edits or use
reset/stash, backup copies or commits to restore. Never stage, commit, push or
publish temporary mutations. Runner output restrictions still apply to each run;
mutation permission does not authorize extra files or environment setup.

Jest reads sibling package source through its mapper; it does not require a
prebuild solely for those mapped imports. Package `main`, `module`, and `types`
typically resolve to `dist/commonjs` or `dist/modules`. Development must prepare
candidate builds and consumer installations; the testing skill verifies what was
supplied without running build/install/pack commands. The existing `typecheck`
script is a TypeScript project build and may emit files, so it is also a
development prerequisite rather than a test-only command. Preserve workspace
links, manifests, dependency ranges and generated outputs. Existing lint checks
may be used without fix/cache flags after reviewing their effects; check that
changed nested test files are actually included by the configured path globs.

## Useful existing patterns and limits

- `packages/@atjson/source-html/test/bold.test.ts` checks expected text and mark
  ranges for both `<b>` and `<strong>`. `renderer-html/test/encoding.test.ts`
  checks exact Unicode and reserved-entity output. Extend expected semantics,
  not merely output presence.
- `packages/@atjson/document/test/serialize.test.ts` covers serialized structure
  and error cases; `equals.test.ts`, `nested-slices.test.ts` and the other document
  suites protect shared primitives. Inspect active assertions and skipped blocks
  when choosing coverage.
- `packages/@atjson/renderer-commonmark/test/commonmark-spec.test.ts` generates
  fixtures from `commonmark-spec`, compares representations and snapshots, and
  explicitly skips selected examples. Keep skip reasons visible; specification
  fixture counts do not equal executed passing cases.
- `packages/@atjson/source-ckeditor/test/source-classic-build.test.ts` converts
  model fragments. `source-classic-build-editor.test.ts` constructs the upstream
  ClassicEditor under jsdom with a mocked `ResizeObserver`. It checks model
  conversion, not real-browser layout, the custom Condé Nast editor build, or
  application toolbar appearance.
- Inspect `tests/html-round-trip.test.ts` before relying on its name. A bare
  `expect(original.equals(roundTrip))` without a matcher asserts nothing. A
  checked-in fixture or nominally passing suite is insufficient without a real
  assertion. If the current development branch provides
  `test:html-round-trip` and a known-failure registry, inspect those actual files
  and runner effects before selecting it. Preserve registry checks and do not
  turn known failures into ignored inputs. Do not invent that script on branches
  without it or modify it to change its output locations.

For conversion-performance changes, inspect the existing benchmark's test cases
and ask development to run its prepared benchmark workflow when needed. These
scripts produce profile files, so this testing skill does not run them, create
baseline directories or prepare alternate checkouts. A performance status alone
does not establish functional correctness or an enforced slowdown failure.

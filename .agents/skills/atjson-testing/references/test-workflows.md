# AtJSON runners and assertion examples

Resolve the checkout and selected revision using the
[checkout check](test-evidence.md#checkout-and-revision-check). Test edits require
the task's implementation branch; read-only validation also supports verified
unchanged consumers and prepared pinned baseline/candidate revisions.

Read current `.nvmrc`, `package.json`, `babel.config.js`, affected manifests and
`.github/workflows/ci.yml`. Use the repository-declared runtime; do not copy
another checkout's version or invent an npm requirement. Ask development to
prepare missing runtimes/dependencies and required build/install configuration
within the active task. Testing does not silently change those inputs.

## Execute focused and required checks

Root `npm test` runs the local Jest binary. Its `moduleNameMapper` maps
`^(@atjson/.*)$` to `packages/$1/src/index.ts`; Babel handles TypeScript/JSX, and
upstream CKEditor JavaScript is exempted from the transform-ignore rule. Package
tests generally live in `packages/@atjson/<package>/test/*.test.ts[x]`; root
`tests/` contains integration cases. Package manifests do not uniformly declare
test scripts, so use root Jest and inspect its current discovery configuration.

Normal Jest cache/transform data is permitted in approved ignored or temporary
task locations. `--no-cache` does not make Jest write-free and is not a substitute
for understanding runner effects. Inspect hooks/reporters for additional writes
and network calls. Keep generated results out of source commits and preserve
required evidence in the existing task. Do not block a normal installed runner
solely because it creates its expected local cache or report.

For example, from the verified repository root:

```sh
npm test -- --runInBand --watchman=false --ci --runTestsByPath packages/@atjson/document/test/serialize.test.ts packages/@atjson/document/test/equals.test.ts
npm test -- --runInBand --watchman=false --ci --runTestsByPath packages/@atjson/source-html/test/bold.test.ts packages/@atjson/renderer-html/test/encoding.test.ts
npm run test:html-round-trip -- --ci
```

Select cases by actual impact; these examples do not cover every change.
`--listTests` discovers files but does not run assertions. `--ci` prevents automatic
snapshot updates. Confirm nonzero execution, normal discovery and required case
counts; report filtered, skipped, focused and failed cases. Preserve actual
selectors and candidate identity when diagnosing missing coverage.

Follow the [sensitivity protocol](feature-testing.md#demonstrate-the-test-detects-incorrect-behavior)
for any intentional local defect. Preserve exact original bytes and unrelated
edits, require pass → semantic failure → exact restore → pass, and verify the
source diff/index. Never stage, publish or hand off a mutation. Prepared immutable
baseline execution does not require mutating a source checkout.

## Build and artifact boundaries

Jest source mapping does not require prebuilding those mapped imports. It also
does not prove package integration. Package `main`, `module` and `types` typically
resolve to `dist/commonjs` or `dist/modules`. Development prepares approved builds
and consumer installations; test execution verifies the actual supplied artifacts
and paths. Preserve workspace links, manifests and unrelated dependency selections.

The existing `typecheck` script is a TypeScript project build and can emit files.
Run it through the task's prepared validation environment when required and retain
outputs in the approved location; do not mislabel it a write-free command. Existing
lint can run without fix flags after reviewing effects. Check that its configured
globs include changed nested tests. Missing setup is a concrete task prerequisite,
not a reason to omit required validation or ask for the same authorization again.

## Useful existing patterns and limits

- `packages/@atjson/source-html/test/bold.test.ts` checks expected text and mark
  ranges for `<b>` and `<strong>`. `renderer-html/test/encoding.test.ts` checks
  exact Unicode and reserved-entity output. Assert semantics, not output presence.
- `packages/@atjson/document/test/serialize.test.ts` covers serialized structure
  and errors. `equals.test.ts`, `nested-slices.test.ts` and neighboring suites
  protect shared primitives. Inspect active assertions and skipped cases.
- `packages/@atjson/renderer-commonmark/test/commonmark-spec.test.ts` generates
  specification fixtures, compares representations/snapshots and skips selected
  examples. Fixture counts do not equal passing executed cases; report skips.
- `packages/@atjson/source-ckeditor/test/source-classic-build.test.ts` converts
  model fragments. `source-classic-build-editor.test.ts` uses upstream
  ClassicEditor under jsdom with mocked `ResizeObserver`. It does not prove
  real-browser layout or downstream toolbar appearance.
- Root `tests/html-round-trip.test.ts` must contain meaningful matchers and execute
  required fixtures. Read the actual `test:html-round-trip` script and expiring
  known-failure registry. Preserve registry checks, flag changed signatures and
  unexpected passes, and never weaken assertions or hide affected failures.

For performance changes, use prepared benchmark inputs and the repository's
existing workflow in approved artifact locations. Keep baseline/candidate identity
and profiles separate. A performance status alone proves neither functional
correctness nor an enforced slowdown threshold.

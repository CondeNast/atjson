# AtJSON runner semantics

Read current `.nvmrc`, root `package.json`, `babel.config.js`, affected manifests
and `.github/workflows/ci.yml`; use the declared runtime and installed dependencies.
Root `npm test` runs Jest. Package manifests do not uniformly declare test scripts.

## Source tests and discovery

Jest maps `^(@atjson/.*)$` to `packages/$1/src/index.ts`; Babel handles TypeScript
and JSX, and upstream CKEditor JavaScript is exempted from transform-ignore.
These mapped imports need no prebuild. Tests normally live in
`packages/@atjson/<package>/test/*.test.ts[x]`; root `tests/` contains integration
checks. Inspect current selectors and hooks before choosing a focused run:

```sh
npm test -- --runInBand --watchman=false --ci --runTestsByPath packages/@atjson/document/test/serialize.test.ts packages/@atjson/document/test/equals.test.ts
npm test -- --runInBand --watchman=false --ci --runTestsByPath packages/@atjson/source-html/test/bold.test.ts packages/@atjson/renderer-html/test/encoding.test.ts
npm run test:html-round-trip -- --ci
```

`--listTests` discovers files but executes no assertions; `--ci` prevents automatic
snapshot updates. Verify nonzero execution and actual case counts. Normal Jest
cache/transform output is expected, including in system temporary directories;
`--no-cache` does not make execution write-free. Keep generated output untracked.

## Builds and outputs

`build` emits CommonJS and ES modules. `typecheck` is a forced TypeScript project
build and may emit files. Package `main`, `module` and `types` commonly resolve to
`dist/commonjs` or `dist/modules`; source-mapped tests cannot validate these packed
entrypoints. Preserve workspace links and dependency selections when installing.
Check that lint's configured globs include changed nested tests.

The HTML round-trip reporter prints preservation classifications and optionally
writes JSON through `ATJSON_HTML_ROUND_TRIP_REPORT`. See
[tests/README.md](../../../../tests/README.md) for the output contract and exact
known-failure accounting. Requested reports reject missing, duplicate or skipped
required execution. Use synthetic/public content and public tracking references.

## Useful suite limits

- `document/test/serialize.test.ts`, `equals.test.ts` and `nested-slices.test.ts`
  cover serialized structure, equality and slice relationships.
- `source-html/test/bold.test.ts` checks mark ranges; `renderer-html/test/encoding.test.ts`
  checks exact Unicode/escaping. Output presence alone is insufficient.
- `renderer-commonmark/test/commonmark-spec.test.ts` has selected skips; generated
  fixture counts do not equal passing executed cases.
- `source-ckeditor/test/source-classic-build-editor.test.ts` uses jsdom and mocked
  `ResizeObserver`; it does not establish real-browser layout.
- Performance scripts generate profile files. Keep baseline/candidate identities
  and profiles separate; a performance status does not prove functional behavior.

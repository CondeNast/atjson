# AtJSON repository instructions

Use the local [copilot-package adapter](.agents/skills/copilot-package/SKILL.md) for agent-assisted work. `copilot-app` is the coordinator for onboarding, access checks, one approved plan, and a shared task record across the affected repositories. Prepare a task branch here only when this repository needs edits; a package-only task can leave the app unchanged. Preserve unrelated work and use the coordinator's explicit branch-preparation procedure.

This is `CondeNast/atjson`, the foundational `@atjson/*` workspace under `packages/@atjson/*`. The separate `CondeNast/copilot-atjson` repository owns Copilot-specific `@condenast/*` packages. Trace actual package imports and consumers rather than treating these as interchangeable checkouts or assuming every change passes through the same repository chain.

## Setup and commands

Read `.nvmrc`, root `package.json`, affected package manifests, and `.github/workflows/ci.yml` before selecting commands. Run the coordinator access gate first, select this checkout's runtime with `nvm use`, then run its local checkout check through the app helper. Authorized setup recovery follows the shared lifecycle and native execution approvals.

```sh
npm ci
npm run build
npm run lint
npm run typecheck
npm test
npm test -- --runTestsByPath packages/@atjson/document/test/document.test.ts
```

The root build uses TypeScript project builds for CommonJS and ES modules. `typecheck` is a forced project build and may emit output. Run targeted Jest tests from the root: packages do not uniformly declare their own test/build/lint scripts, so use current manifests when older contributing instructions differ. Root npm engines are not currently declared; do not invent an npm pin or change runtime declarations to match another repository.

## Source and validation

- `packages/@atjson/document/src/` contains the document, annotation, editing, and serialization primitives. Changes here can affect all sources and renderers.
- `packages/@atjson/offset-annotations/` defines the common annotation schema. Start HTML/CommonMark conversion work in `source-html`, `source-commonmark`, and their corresponding renderer packages; inspect converters and package tests alongside the changed source.
- Tests live in package `test/` directories, with integration fixtures in `tests/fixtures/`. `tests/html-round-trip.test.ts` is an existing integration entrypoint, but its current `expect(originalDoc.equals(...))` has no assertion matcher. Do not count that result as proof of preservation; use an asserting regression test and record this limitation until it is fixed within an approved task.
- For conversion fixes, preserve text, annotations, attributes, and supported embedded content. Add a deterministic regression case that distinguishes intentional normalization from lost data. Do not update snapshots merely to hide a failure or commit private article content.
- Run the relevant root lint, test, and typecheck checks and validate affected direct consumers identified by the shared graph, including direct app dependencies. Record baseline failures and unavailable checks separately.

## Packages and delivery

Preserve existing workspace `file:` links and package peer requirements. Build before packing and inspect the package's declared `main`, `module`, `types`, and published files; the TypeScript packages commonly emit `dist/commonjs` and `dist/modules`. Do not edit generated output directly or commit temporary tarball dependencies. Use the coordinator's delivery procedure for integration, exact published versions, source evidence, and readiness.

Use Conventional Commits and existing repository conventions. Do not manually publish, merge, or alter release workflows without task authority. The reviewed `.github/workflows/release.yml` only triggers on pushes to `main`; its comment-conditioned prerelease job has no matching comment or dispatch event. A usable prerelease route and AI-review workflow are not verified here. Reinspect current default-branch capabilities before delivery and report missing support; do not copy another repository's trigger or equate an npm script with authorization to publish.

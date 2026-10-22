---
name: atjson-development
description: Develop and validate AtJSON document primitives, annotations, sources, renderers, and public package contributions.
---

# Develop AtJSON

Read [AGENTS.md](../../../AGENTS.md) for the optional local task reference and
public contribution boundary. This skill requires no private repository access.

1. Read `.nvmrc`, root `package.json`, affected package manifests, and
   `.github/workflows/ci.yml`. Use this checkout's declared runtime. Root npm
   engines are not declared; do not invent an npm version requirement.
2. Trace the affected packages under `packages/@atjson/`. Document/annotation
   primitives live in `document`; the shared schema lives in
   `offset-annotations`. Inspect the relevant source, converter, renderer, and
   tests together. Determine affected consumers from actual dependency edges.
3. Define expected preservation and permitted normalization before editing.
   For a conversion fix, add a deterministic regression that demonstrates the
   failure. Preserve text, marks, attributes, ranges, and supported embedded
   content. Never change snapshots just to hide a discrepancy.
4. Run targeted tests through root Jest; package directories do not uniformly
   declare their own scripts. Run applicable root checks:

   ```sh
   npm ci
   npm run build
   npm run lint
   npm run typecheck
   npm test -- --runInBand --watchman=false
   npm run test:html-round-trip
   ```

   The root build emits CommonJS and ES modules. `typecheck` is a forced
   TypeScript project build and may emit files. Documentation-only changes need
   link and instruction checks; report unrun checks accurately.

5. Follow the [HTML preservation guide](../../../tests/README.md) for meaningful
   round-trip assertions and the exact, expiring known-failure registry. Required
   cases execute; changed signatures, unexpected passes, and expired records
   need review. Do not weaken assertions or add affected failures as exceptions.
6. Build before packing. Inspect declared `main`, `module`, `types`, packed
   contents, and consumer resolution. Preserve workspace `file:` links and peer
   requirements. Keep temporary tarballs, dependency paths, and generated build
   output out of the PR. Report source checks, consumer checks, and publication
   separately.

Use Conventional Commits and repository PR conventions. Inspect the live
default-branch release workflow before a release action; a package script does
not establish publishing authority or a working prerelease route. Do not alter
release automation or publish without task authorization. Report unsupported
capabilities explicitly. Agents never merge PRs.

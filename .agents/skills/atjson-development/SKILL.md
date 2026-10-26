---
name: atjson-development
description: Develop and validate AtJSON document primitives, annotations, sources, renderers, and public package contributions.
---

# Develop AtJSON

Read [AGENTS.md](../../../AGENTS.md) for the optional local task reference and
public contribution boundary. Standalone AtJSON work requires no private checkout.
Use the [native testing skill](../atjson-testing/SKILL.md) for relevant regressions.

1. Read `.nvmrc`, root/affected `package.json` files and `.github/workflows/ci.yml`.
   Use this checkout's declared runtime; root npm engines are not declared.
2. Trace packages under `packages/@atjson/`: document/annotation primitives in
   `document`, shared schema in `offset-annotations`, and the relevant source,
   converter and renderer implementations. Follow actual imports and consumers.
3. Define expected preservation and permitted normalization. Add a deterministic
   regression for conversion fixes; preserve text, marks, attributes, ranges and
   supported embedded content. Do not accept discrepancies through snapshots.
4. Install from the lockfile and run applicable root checks:

   ```sh
   npm ci
   npm run build
   npm run lint
   npm run typecheck
   npm test -- --runInBand --watchman=false
   npm run test:html-round-trip
   ```

   See [runner semantics](../atjson-testing/references/test-workflows.md) for
   focused selections, emitted files and public round-trip reports.

5. Build before packing; inspect `main`, `module`, `types`, packed contents and
   installed consumer resolution. Preserve workspace `file:` links and peer
   requirements. Keep temporary tarballs, dependency paths and build output out
   of source commits. Source checks do not prove package integration.

Use Conventional Commits and repository PR conventions. Read the actual
release workflow before a release; package scripts alone establish neither
publishing authority nor supported release behavior. Agents never merge PRs.

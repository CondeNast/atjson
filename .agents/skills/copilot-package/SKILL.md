---
name: copilot-package
description: Coordinate foundational AtJSON features, fixes, tests, and package delivery through the shared copilot-app lifecycle, using this repository's @atjson package and conversion conventions.
---

# Work on foundational AtJSON

Use `copilot-app` as the coordinator and read its [copilot-start skill](../../../../copilot-app/.agents/skills/copilot-start/SKILL.md) and [shared lifecycle](../../../../copilot-app/.agents/skills/copilot-start/references/lifecycle.md). These links assume sibling checkouts. For another layout, resolve the same resources from the actual app path recorded for the task. Do not begin implementation or branch preparation until the coordinator and required access are available. Route authorized setup recovery through the shared lifecycle and native execution approvals.

Reuse one approved plan and task record with actual checkout paths, affected packages and consumers, branch/base revisions, validation, and delivery evidence. Establish whether this is a continuation before preparing branches. Branch this repository only if it needs edits. The app may coordinate a package-only task without an app diff or PR.

Read the local [AGENTS.md](../../../AGENTS.md), `.nvmrc`, root and affected package manifests, and `.github/workflows/ci.yml`. This is `CondeNast/atjson` with `packages/@atjson/*`; do not substitute `CondeNast/copilot-atjson` and its Copilot-specific `@condenast/*` packages.

- Use this checkout's declared runtime and root `npm ci`, `build`, `lint`, `typecheck`, and Jest commands. `typecheck` may emit files. Run package tests through root Jest rather than assuming each package has scripts.
- Trace document/annotation primitives, offset annotations, and the relevant source/converter/renderer. Follow actual dependency edges to all affected consumers; foundational changes may reach the app directly.
- Use the shared testing skill to add an asserting regression case. Existing integration fixtures live in `tests/fixtures/`; the current HTML round-trip test lacks an assertion matcher and cannot establish preservation by itself. Record that gap and any known failures explicitly.
- Build package outputs before using the shared tarball workflow, preserve established workspace links and peer ranges, and keep temporary artifacts and paths out of committed dependencies.
- Use the shared delivery skill, but verify this repository's capabilities first. The reviewed release workflow only receives pushes to `main`; no working prerelease event or AI-review workflow is verified. Report those blockers rather than invoking another repository's comment or label trigger. Keep consumers awaiting required publication in the state required by the shared lifecycle.

Report local validation separately from consumer integration and publication. This adapter does not authorize publishing, merging, deployment, or release-workflow changes.

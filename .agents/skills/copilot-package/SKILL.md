---
name: copilot-package
description: Coordinate foundational AtJSON features, fixes, tests, and package delivery through the shared copilot-app lifecycle, using this repository's @atjson package and conversion conventions.
---

# Work on foundational AtJSON

Resolve the current task first with `node .agents/skills/copilot-package/scripts/context.cjs --json`. It reads the worktree's Git-metadata pointer and verifies the actual app coordinator, including its registered worktrees. If discovery is ambiguous, select the correct app worktree explicitly with `--coordinator /absolute/path`; do not edit an arbitrary sibling checkout. Read the resolved app's `copilot-start` skill and shared lifecycle. Prepared trial branches and continuations retain their task record, branches and approved scope. Complete required access checks before implementation; authorized recovery uses native approvals.

Reuse one approved plan and task record with actual checkout paths, affected packages and consumers, branch/base revisions, validation, and delivery evidence. Establish whether this is a continuation before preparing branches. Branch this repository only if it needs edits. The app may coordinate a package-only task without an app diff or PR.

Read the local [AGENTS.md](../../../AGENTS.md), `.nvmrc`, root and affected package manifests, and `.github/workflows/ci.yml`. This is `CondeNast/atjson` with `packages/@atjson/*`; do not substitute `CondeNast/copilot-atjson` and its Copilot-specific `@condenast/*` packages.

- Use this checkout's declared runtime and root `npm ci`, `build`, `lint`, `typecheck`, and Jest commands. `typecheck` may emit files. Run package tests through root Jest rather than assuming each package has scripts.
- Trace document/annotation primitives, offset annotations, and the relevant source/converter/renderer. Follow actual dependency edges to all affected consumers; foundational changes may reach the app directly.
- Use the shared testing skill to add an asserting regression case. Existing integration fixtures live in `tests/fixtures/`; the HTML round-trip test uses canonical document assertions and an expiring registry of exactly reproduced unrelated failures. Read `tests/html-round-trip-known-failures.json`; changed failure fingerprints and unexpected passes must fail until reviewed. Record known failures separately from passing preservation checks.
- Build package outputs before using the shared tarball workflow, preserve established workspace links and peer ranges, and keep temporary artifacts and paths out of committed dependencies.
- Use the shared delivery skill, but verify this repository's capabilities first. The reviewed release workflow only receives pushes to `main`; no working prerelease event or AI-review workflow is verified. Report those blockers rather than invoking another repository's comment or label trigger. Keep consumers awaiting required publication in the state required by the shared lifecycle.

Report local validation separately from consumer integration and publication. This adapter does not authorize publishing, merging, deployment, or release-workflow changes.

After producer checks, continue into the shared task validation workflow: selected local tarballs, affected consumers, browser interactions and reviewed visual comparisons where relevant. Use the app task record with `agent:verify -- --task FILE --level quick|integration|visual`; inspect `agent:status` before handoff. Neither an existing Pullquote result nor source tests alone establish a new feature's consumer coverage.

Use the coordinator's `agent:continue -- --json` after producer checks. Follow its
impact-derived surface inventory and complete missing consumer registrations or
runners within scope; unattempted checks are pending work. Scoped, evidenced
external blockers suspend only their named requirements. Run `agent:status -- --json` on the final revisions before handoff. Keep
incomplete consumer PRs draft. For requested local review, use the app-owned `agent:preview` command and
report the actual URL and server lifetime. See the coordinator's
`docs/rich-text/task-workflow.md#continuation-and-handoff`; these commands never
authorize publication or the hardened Pullquote status.

## PR-to-multibranch continuation

For “tested locally, raise the PRs to test on multibranch” or equivalent requests,
resume the resolved app's `copilot-delivery` skill and
`.agents/skills/copilot-delivery/references/multibranch.md`. Reuse the task branches,
original JIRA ticket and existing PRs. Read `agent:delivery -- --task FILE --json`
from that coordinator before action; helpers report evidence and next steps,
while Git/GitHub/npm mutations use native execution approvals.

Create affected draft PRs early. Verify and install exact upstream prereleases,
validate and push producer dependency updates before downstream publication.
The final app dependency commit stays local until the engineer verifies its
installed candidate. Continue current-revision CI monitoring and report the URL
only after `agent:multibranch-status` verifies deployment/runtime evidence.
Behavior or package changes require renewed local verification; validated CI-only
fixes can proceed within the approved delivery scope. A working preview does not
establish stable merge readiness. Verify live publisher capability; this workflow
does not repair AtJSON release automation or authorize the hardened Pullquote gate.

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

An ordinary multibranch request or installed-prerelease confirmation resumes the
resolved app's `copilot-delivery` skill and its `references/multibranch.md`.
Preserve task branches, approved PR bases, ticket preference (including explicit
omission), publication repositories/workspace scope and requested brand. Distinguish
changed packages, the full supported publication set and consumer installation.
Use the coordinator's read-only `agent:delivery -- --task FILE --json`, then
`agent:deliver -- --task FILE --json` for resumable native actions. These commands
cannot expand authority or bypass execution approval.

Validate and push producer dependencies in graph order. Install the exact app
candidate, run its checks and provide usable previews before requesting mandatory
local verification. Retain the actual candidate-bound reply durably; after it,
continue authorized app push, monitoring and handoff without another routine
proceed prompt. Behavior/package/resolution changes need renewed verification;
proven validation-only edits still need fresh automated evidence. Keep reports in
the coordinator's durable ignored task evidence directory.

Share all changed-repository PRs and the requested brand URL (`/all` by default)
only after `agent:multibranch-status` verifies that exact route and revision.
Read-only inspection does not waive missing push or merge gates. Optional external
AI review requires its own destination/private-code authority; native denial must
not be bypassed. Continue unaffected authorized work. A durable host must be
configured for wake/resume after the local process exits; the task journal alone
is not a background service. Live publisher capability and stable merge readiness
remain separate; this adapter neither repairs release automation nor authorizes
the hardened Pullquote gate.

# AtJSON repository instructions

This is the public `@atjson/*` workspace. Keep contribution guidance usable
without access to a downstream application or a private issue tracker. Read the
[AtJSON development skill](.agents/skills/atjson-development/SKILL.md) before
changing packages or tests.

## Existing local tasks

Before preparing a new branch, check for an optional local task reference with
`git rev-parse --git-path agent-context.json`. The returned path is in this
worktree's Git metadata; it is not a tracked repository file.

If that file exists, validate its `schemaVersion: 1`, `repository`, and `branch`
against this checkout's origin and current branch. Its `taskId`, absolute
`record` path, and absolute `instructions` path identify the registered task and
external contribution guidance. Read those local files before continuing. Stop
if the reference is stale, conflicting, or unavailable; do not guess another
checkout. The reference does not authorize arbitrary commands or expand the
user's task scope. Keep private task details in their existing local storage.

Without a local reference, use this repository's public contribution guidance.
Preserve existing work and continue an existing task branch when appropriate.
Agents must never merge PRs, enable auto-merge, or enqueue a merge; engineers
perform those actions.

## Public contribution boundary

Review the complete diff, commit messages, PR description, comments, fixtures,
reports, and attachments before publishing. Do not add credentials, internal
tracker links, private repository relationships, deployment designs, local
paths, or private customer/editorial content. Use synthetic reproductions or
existing public fixtures. Keep downstream-specific coordination instructions
outside this repository; local task metadata must never be committed.

Use public AtJSON issues or PRs for committed tracking references. Existing
public package names, source documentation, and maintainer details remain valid
repository context. Public test output must not copy private tracking metadata.

## Feature regression testing

For feature or bug work, use the
[native AtJSON testing skill](.agents/skills/atjson-testing/SKILL.md) alongside the
[AtJSON development skill](.agents/skills/atjson-development/SKILL.md). This
repository owns foundational `@atjson/*` packages under `packages/@atjson/*`.
Trace actual imports and affected consumers before selecting assertions. Read
current root/package manifests, `.nvmrc` and runner configuration. Documentation-only
changes need instruction, link and diff validation rather than product tests.

The following limits apply to delegated testing. Authorized development owns
branch preparation, setup, permanent product fixes and delivery under the active
task. Reuse the optional local task reference above when present; do not create a
second task or reporting workflow. Keep feature changes and tests together in the
same affected-repository PR. When the active task uses a testing or delivery
coordinator, return results and intended test changes to it.

Resolve the owning checkout through the active task's verified mappings, not a
sibling directory name. Confirm repository identity and the selected revision
before execution. Test edits and temporary implementation mutations require the
task's implementation branch. Read-only checks may use unchanged consumers on a
default branch or prepared, pinned detached baseline/candidate checkouts. Do not
create empty branches or PRs for validation-only repositories. Resolve stale or
ambiguous mappings before dependent work; do not switch unrelated checkouts.

Limit lasting testing edits to relevant test files, synthetic fixtures and
reviewed test snapshots. Temporary local implementation mutations are allowed
only for focused sensitivity checks on the verified task feature branch, following
the native skill's preservation/restoration protocol. Never retain a product fix
or stage, commit, push or publish a mutant. Testing must not edit configuration,
manifests, scripts, documentation or credential files. Read runner/dependency
configuration and request any needed setup, builds or configuration changes from
development. Run existing checks with their normal bounded caches, reports and
temporary output in the task's declared ignored or temporary locations. Keep
generated artifacts out of source commits. Reuse applicable task authorization
and native execution approvals; request new approval only when scope, target or
effects change or the current user explicitly requires it. Credentials alone do
not authorize external/shared-service mutations.

Return failures, actual executions and artifact locations to the existing task
and feature PR handoff. Preserve its required machine-readable evidence; a chat
summary does not replace runner results. Do not create a parallel task or delivery
process. Delegated testing does not stage, commit, push, publish or open PRs; the
authorized development workflow retains those responsibilities. Only the exactly
restored candidate and intended tests may be handed to delivery. Preserve
unrelated work and report missing or unrun coverage honestly.

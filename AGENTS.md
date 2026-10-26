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

## Native testing

Use the [AtJSON testing skill](.agents/skills/atjson-testing/SKILL.md) for owning
suites, meaningful preservation assertions and source-versus-package limits.
Read the current manifests, `.nvmrc` and runner configuration. Documentation-only
changes need instruction/link validation rather than product tests.

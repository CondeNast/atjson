# AtJSON testing instructions

This repository owns foundational `@atjson/*` packages under
`packages/@atjson/*`. The separate `copilot-atjson` repository owns Copilot's
Markdown and Verso extensions; inspect actual imports before choosing coverage.

When adding or updating tests for a developed feature, follow the
[native AtJSON testing skill](.agents/skills/atjson-testing/SKILL.md). Read the
current root/package manifests, `.nvmrc`, and runner configuration. Preserve the
existing branch and unrelated work. Documentation-only changes need instruction,
link, and diff validation rather than product tests.

Before any edit or test run, verify each owning checkout is on the active task's
existing feature branch. Never edit or test on `main`, `master`, another default
branch or a detached HEAD. If the branch is wrong or unknown, ask the coordinator
to prepare the task branch; do not switch or create branches from testing.

If this checkout has the development workflow's `copilot-package` adapter, use
its existing coordinator/task resolution. The testing skill supplies regression
tests and their results to the coordinator's `copilot-test` workflow; it does not
replace development orchestration. Keep feature changes and tests together in
the same affected-repository PR managed by `copilot-delivery`. Do not create a
second PR for the same feature's tests.

Limit lasting edits to relevant test files, synthetic fixtures and reviewed test
snapshots. Temporary local implementation mutations are allowed only for focused
sensitivity checks on the verified task feature branch, following the native
skill's preservation/restoration protocol. Never retain a product fix or stage,
commit, push or publish a mutant. Do not edit configuration, manifests, scripts,
documentation or credential files. Read runner/dependency configuration
and request any needed setup, builds or configuration changes from development.
Inspect runner effects before execution; do not run checks that write unrelated
files or outside the repository/workspace. Delegate external/shared-service runs
to the coordinator under the shared authorization workflow.
Return failures to the development workstream. Report
results in the conversation and existing feature PR handoff. Do not create
separate report files, evidence JSON, task records or workspace scaffolding,
inside or outside this repository. Testing does not create branches, stage,
commit, push, publish or open PRs. Only the restored candidate and intended tests
may be handed to authorized development delivery.

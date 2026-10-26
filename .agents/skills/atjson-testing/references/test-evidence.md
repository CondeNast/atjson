# Test the feature and hand results to development

Use this workflow for feature, bug-fix and behavior changes, including when testing
was not separately requested. Add/update relevant test files, synthetic test
fixtures and reviewed test snapshots, then run permitted existing and new assertions.
Product implementation and delivery remain with the development workflow.
Start with the current repository's [native testing skill](../SKILL.md).
Each of the five repositories carries its own testing guidance and entry points
to affected owners. Tests remain in the repositories that own the behavior.

## File and execution boundary

Keep final changes limited to those test files and test data inside their owning
repository. Temporary local implementation changes are allowed only for a focused
[sensitivity check](feature-testing.md#demonstrate-the-test-detects-incorrect-behavior)
on the task's verified feature branch, with exact restoration afterward. Do not
make permanent production fixes or modify package exports, manifests, lockfiles,
runner/CI config, scripts, documentation, skills, AGENTS, credentials or environment files. Do not
create reports, evidence JSON, task records, copied checkouts or temporary files
elsewhere in the repository, workspace, home directory or system temporary directory.
Resolve test paths to the actual owning checkout; do not follow a link that escapes
it. Read other files to understand behavior, select tests and plan the permitted probe.

Before executing a command, inspect its runner, hooks and relevant test helpers for
file writes and network calls. Use the already-installed runner with console output
and supported cache/report generation disabled. Do not install/download anything,
start services, build packages, record live fixtures or run reporting/publication
commands. Apart from the controlled local implementation probe, writes to non-test
files or outside the owning checkout are outside this skill, even when those files
are ignored. Hand required setup or
execution back to development and say which assertions remain unrun.

External service calls and shared-environment writes are not authorized by invoking
this skill. Hand such browser runs to the existing coordinator with the exact target
and effects; keep them pending unless the user separately permits that execution.
Do not send Slack/email, create PRs, publish packages or fetch live editorial content.

## Feature-branch check

Before editing files or running tests in each owning repository, read its actual
branch (for example, `git branch --show-current`) and verify that it is the existing
development task's feature branch. Never work on `main`, `master`, the repository's
default branch or a detached HEAD. A non-default name alone does not establish that
it is the correct task branch. Recheck before each local implementation probe.

If the checkout is not the task's feature branch, stop work in that repository and
ask the coordinator/user for the prepared feature checkout. Do not switch/create
branches, reset or stash user work. Continue independent eligible repositories.
Use existing before-fix evidence rather than checking out `main` for a baseline.

Testing never stages, commits or pushes changes. Temporary mutations must never
enter a commit, PR, publication or deployment. Return only the restored candidate
and intended test changes to the existing delivery owner for separately authorized
delivery. An unresolved restoration problem blocks that handoff.

## Continue the existing feature task

Read the request, approved behavior, complete feature diff and repository
instructions. Reuse the development task's checkout, branch, accepted answers and
prepared package builds. Inspect tracked/untracked changes as well as commits;
the latest commit alone can miss the feature. Preserve unrelated work.

When installed, `copilot-test` coordinates validation and delegates test selection
and authoring to the affected repositories' native testing skills.
Return test paths, commands, working
directories, results and gaps to that same task. `copilot-delivery` retains
ownership of commits and PRs under the user's authorization. Keep feature code and
tests together in **one PR per changed repository**; hand changes to delivery for
the existing feature PR. Independent repositories cannot share
one GitHub PR. A validation-only repository needs no empty commit or PR. Reading
the app's instructions does not count as changing the app. For a CKEditor-only
feature/test diff, delivery creates or updates only the CKEditor PR unless actual
additional changes are needed elsewhere. Do not edit an unchanged repository
merely to manufacture a PR.

At handoff, reuse the existing task's comparison base, mapped checkouts, candidate
dependencies, accepted feature answers and PRs. Include uncommitted and untracked
test changes when returning paths to delivery; checking only committed files can
leave the new assertions out of the feature PR. Missing task context is a concise
clarification or setup gap, not a reason to create another task or switch branches.
If an affected repository is not supported by the development coordinator, still
add/run its available tests and return the gap explicitly. Do not omit that repo,
invent a registration or claim its delivery succeeded.

Testing skills must not independently create branches, commit, push, publish,
deploy, or introduce another delivery workflow. They must not require new report
files, evidence JSON, task records, copied workspaces or other bookkeeping in the
repository, workspace or outside it. Return results in the conversation and the
existing feature PR handoff. Read any task context already managed by development;
do not create or rewrite task records, including existing development-owned files.

## Select the owning tests

1. Account for all five repositories: `atjson` (foundational document/annotations,
   sources and renderers), `copilot-atjson` (Copilot Markdown and Verso),
   `ckeditor` (editor and model/HTML adapters), `copilot-app` (host integration),
   and `copilot-automation` (browser E2E). Mark each affected, unaffected with a
   reason, or unavailable. Load affected native testing skills and read
   applicable repository/scoped development instructions before editing tests.
2. Follow actual imports, manifests, callers, formats and configuration. Upstream
   `atjson` has direct consumers as well as consumers through `copilot-atjson`;
   the graph is not always a straight chain. Add tests in each owner and validate
   affected consumers, including unchanged ones. Hand discovered product defects
   to development; do not silently expand a testing-only task into product fixes.
3. Use [feature discovery](feature-testing.md) for missing requirements and
   independently expected behavior. Inspect matchers, not test names. Reuse
   adequate existing assertions; add acceptance, negative and neighboring
   regressions. Assess the [scenario catalog](article-body-scenarios.md) for
   affected article-body content, tools, layouts and persistence stages.
4. Select applicable unit, integration, browser component and E2E checks. Explain
   excluded layers; every feature does not require every layer in every repo.
   Broaden for shared schema, helpers, toolbar, selection, serialization or saves.
   Verify normal runner/CI discovery when adding tests.
5. Run affected existing tests before editing tests where possible. This baseline
   measures the current feature checkout, not the pre-feature branch. If blocked,
   continue independent checks and say what did not run.

## Add and execute meaningful assertions

Use the owning suite's harness and synthetic fixtures. Test observable behavior,
including active/disabled toolbar feedback and related controls when applicable.
A correct content effect does not prove the correct button highlights. For
converters, assert expected text, marks, ranges, IDs and attributes alongside
round-trip equality; both directions can lose the same data.

For a regression, demonstrate failure for the defect and success after the fix
where practical. For nontrivial new behavior use a focused
[sensitivity check](feature-testing.md#demonstrate-the-test-detects-incorrect-behavior).
An import error, crash or timeout does not prove the intended assertion detects
the bug. Use test-harness fault injection or the controlled local implementation
probe above; restore the exact pre-probe contents before the final check/handoff.
Do not create copied workspaces or install a mutation framework.

Execute new assertions and affected existing tests. Require actual nonzero test
execution and inspect skips. Discovery, syntax checks, builds and writing a test
do not run its assertions. If a test needs dependency, runner configuration or build
changes, return that prerequisite to development instead of making those changes.

Verify the installed/resolved candidate package versions and artifacts supplied
by development before consumer checks. Adjacent checkouts do not replace installed
packages. A staging result cannot validate unpublished code. Repeat affected
checks after relevant code, test, fixture or dependency changes.

For persistence, use the actual editor, inspect the first save payload, require a
successful response without GraphQL errors, reload the same disposable content,
and observe a fresh read with the expected semantics. A remount or stubbed backend
does not prove live storage. Author these assertions in the owning test suite;
execution follows the file/network boundary above and fresh shared-write approval.
For catalog cases, assess publish and schedule preservation independently as well;
save/reload cannot stand in for either. Follow the [lifecycle assertions](article-body-scenarios.md)
and keep unavailable permissions, data or lifecycle checks explicitly incomplete.

## Authentication blockers: ask for local setup

Identify the selected runner's actual credential inputs from its configuration.
Check presence without printing values. Distinguish missing, expired/rejected,
insufficient permissions and unknown causes; a private-package 404 alone does
not prove missing credentials. Request only access needed by the selected check.

Use the available popup (`request_user_input_async` when available) to name blocked
tests, exact missing variable names/login and secure local setup steps. Offer
"Configured locally — retry" or "Skip these checks for now". Never request passwords,
tokens, MFA seeds/codes or credential files in chat, popups or attachments. Ask the
user or development workflow to prepare the runner's existing local login/config.
The testing skill must not run login commands, edit credentials or create setup files.

The user requests a popup for every new or renewed credential blocker, including
a failed retry after earlier setup. Keep an unanswered popup pending rather than
duplicating it. After confirmation, recheck readiness without revealing values
and retry once; further attempts need a relevant setup change and confirmation.
Credentials do not authorize writes. Each separately initiated shared-environment
write/run or retry needs fresh approval under the
[authorization workflow](feature-testing.md#authorization-and-local-credential-setup).

Exports in another terminal do not reach an existing agent. Use supported local
setup, or have the user run the exact command in that configured terminal. A
"ready" answer is not proof a test passed. Continue independent checks while
waiting. If skipped/unanswered, say "Not run: waiting for local credential setup",
with the exact missing/unverified input, affected tests and next action.
Keep secrets and private editorial content out of output and the PR; inspect and
redact existing artifacts before sharing.

## Return results to the same feature and PR

Give a short summary in the conversation and existing PR handoff:

- Added/updated test paths, behaviors asserted, related regressions selected and
  applicable asset/embed scenarios still missing.
- Each tested repository's actual candidate, dependency builds, command, working
  directory, execution counts and result. Distinguish a selected subset from a
  full suite. Keep baseline, final execution and retries separate.
- Failures, skips, timeouts, suspected flakiness and setup/credential blockers:
  what remains unverified and the concrete next action.
- Sensitivity evidence where established; otherwise say it was not established.
  Manual verification is additional evidence and cannot make unrun checks pass.

Use PASS only when required current-candidate assertions executed successfully
with no required gaps. Use FAIL for an unresolved required assertion failure and
INCOMPLETE for missing, stale, blocked, skipped, flaky or unexecuted checks. A
matching run on the base revision is needed to call a failure pre-existing.
Do not sum retries into a coverage total or invent confidence percentages.

Return results to `copilot-test` and authorized `copilot-delivery` when present.
A helper passing, tests being written or planned manual review does not establish
feature validation. These skills guide the work; actual runners and existing
development gates provide executable checks.

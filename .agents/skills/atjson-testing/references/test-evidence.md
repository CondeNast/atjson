# Test the feature and hand results to development

Use the [native testing skill](../SKILL.md) for feature and bug regression work.
Reuse the active development task, selected revisions, accepted answers and
prepared package builds. Tests stay with the repository that owns the behavior.

## File and execution boundary

Delegated testing keeps lasting edits within relevant test files, synthetic
fixtures and reviewed snapshots. Return permanent product defects and required
manifest, runner/configuration or dependency changes to the authorized development
workflow. A focused implementation probe follows the
[sensitivity protocol](feature-testing.md#demonstrate-the-test-detects-incorrect-behavior)
and must restore the exact candidate before handoff.

Inspect runner/hooks for writes and service effects before execution. Existing
runners may create normal caches, reports, screenshots, browser profiles and
other temporary output in declared ignored or temporary task locations. Permit
bounded local test services and prepared build artifacts when required by the
approved validation. Keep source and the Git index unchanged during read-only
checks and exclude generated output from source commits. Do not write into
unrelated worktrees or expose credentials/private content in artifacts.

Reuse the task's required machine-readable results and verification receipts.
When a coordinator owns a build, install, service or registered validation runner,
invoke or request that prepared execution and collect actual results into the
same task; do not substitute a chat summary or silently mark it passed. Missing
setup stays explicit while independent checks continue. Do not create another
task, reporting process or delivery workflow.

External shared-service writes and publication require authorization for the
actual target and effects. Reuse existing applicable scope and native execution
approvals; do not prompt again simply because the same approved check is rerun.
See the [authorization guidance](feature-testing.md#authorization-and-local-credential-setup).
A testing skill alone does not authorize new external actions or live data access.

## Checkout and revision check

Resolve the task's mapped checkout and verify its origin, branch/revision and
ownership. Use the neutral local reference in [AGENTS.md](../../../../AGENTS.md)
when present. A sibling directory name does not identify a selected repository.
Read another repository's instructions only from the verified mapping; if it is
missing, stale or ambiguous, resolve it before dependent work rather than guess.

Source/test edits and implementation probes require the task's implementation
branch. Do not edit default branches, unrelated branches or detached validation
checkouts. Read-only checks may run on an unchanged consumer's default branch or
a prepared pinned detached baseline/candidate revision. Record which revision and
role was tested. No empty feature branch or PR is needed for unchanged consumers.
A prepared baseline run is valid evidence, not a reason to switch the engineer's
working checkout. Preserve uncommitted and untracked unrelated work throughout.

Delegated testing does not create branches, stage, commit, push or publish.
Authorized development handles preparation and delivery with the restored
candidate and intended tests. Agents never merge PRs. If restoration is unresolved,
stop the handoff; continue independent eligible checks.

## Select the owning tests

1. Read the complete feature diff, actual imports, manifests, callers and
   configuration. Distinguish edited packages from consumers requiring checks;
   include direct dependencies and peers rather than assuming a linear chain.
2. Map expected behavior to existing adequate assertions and missing cases.
   Use [feature discovery](feature-testing.md) for unresolved decisions and
   independently expected values, with negative and neighboring regressions.
3. Select owning unit/conversion checks and affected integration boundaries.
   Library output does not prove real-browser behavior or live persistence.
   Keep downstream-specific requirements in their authorized location.
4. Execute affected tests before adding coverage where possible. Identify whether
   that is the current candidate or a pre-feature baseline. Verify normal discovery
   when adding tests and require nonzero assertion execution.
5. Verify installed/resolved candidate package contents, versions and identities
   before consumer tests. Adjacent source trees do not replace installed packages,
   and a remote environment cannot prove unpublished candidate behavior.

Use existing harnesses and synthetic or public fixtures. Assert expected text,
marks, attributes, IDs and ranges alongside round-trip equality; both directions
can lose the same information. Establish meaningful sensitivity where practical.
Distinguish new test code, discovered files, build success and actual assertions.
Repeat affected checks when relevant source, tests, fixtures or dependencies change.

For an approved consumer persistence journey, distinguish frontend stateful-test
backend coverage from real-service storage. Inspect the first write, fresh read
and preserved semantics appropriate to that contract. A cached remount does not
prove persistence. Run external service actions only within established scope;
missing service access must not erase successful bounded frontend evidence or
make a required live check pass.

## Authentication blockers: ask for local setup

Identify actual credential inputs from the selected runner's configuration and
check presence without revealing values. Distinguish missing, expired/rejected,
insufficient access and unknown causes. Request only the access needed by the
selected check, and give exact secure-local remediation when input is necessary.
Never request passwords, tokens, MFA values or credential files in conversation.

Reuse existing setup and approval information; do not repeat an unresolved request.
After a relevant setup change, recheck readiness and retry once within scope.
Investigate another failure before further attempts. Credentials do not grant
permission for writes. Exports in another terminal do not update an existing
agent's environment, and a readiness acknowledgement does not prove tests passed.
Continue independent checks while blocked and report unrun coverage accurately.

## Return results to the same feature and PR

Return the following through the existing task and feature handoff:

- Test/fixture paths, independently expected behaviors and neighboring checks.
- Selected repository/revision, artifact identity, command and working directory.
- Expected versus executed counts, actual results and approved artifact locations.
- Separate baseline, candidate, retry and sensitivity results.
- Failures, skips, suspected flakiness, missing consumers and concrete next actions.

Preserve required machine-readable verification evidence. Summaries explain it
but do not replace it. Inspect artifacts before sharing and remove private task
metadata or content from public output.

Use PASS only when all required current-candidate checks executed successfully.
Use FAIL for an unresolved required assertion failure and INCOMPLETE for missing,
stale, blocked, skipped, flaky or unexecuted required checks. A matching baseline
execution is necessary to identify a pre-existing failure; affected failures
remain blocking. Do not invent confidence percentages or sum retries into totals.

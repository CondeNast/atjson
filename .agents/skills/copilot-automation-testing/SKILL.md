---
name: copilot-automation-testing
description: Test browser E2E journeys and real save/reload assertions when feature development or a bug fix crosses into copilot-automation. Load its native testing instructions and return results to the feature's development flow.
---

# copilot-automation testing entry point

`copilot-automation` owns browser E2E journeys and real save/reload assertions. From `atjson`, continue testing in that checkout
when its behavior or a shared contract is affected:

1. Follow the [shared testing workflow](../atjson-testing/references/test-evidence.md) and
   [feature behavior and coverage contract](../atjson-testing/references/feature-testing.md). For affected article-body
   work, assess the [asset and embed scenario catalog](../atjson-testing/references/article-body-scenarios.md).
2. Read the target [AGENTS.md](../../../../copilot-automation/AGENTS.md) and
   [native copilot-automation-testing skill](../../../../copilot-automation/.agents/skills/copilot-automation-testing/SKILL.md) before changing tests or running its suites.
3. Keep final changes to relevant tests, synthetic fixtures and reviewed snapshots.
   Verify the owning checkout is the task's feature branch before every edit/run;
   never work on main/master/default branches or detached HEAD. Temporary local
   implementation mutations follow the shared sensitivity/restoration procedure.
   Restore exact pre-probe contents, preserve user edits and rerun before handoff.
   Testing never stages, commits or pushes anything; no mutation may reach delivery.
   Other config, script, manifest, credential, documentation and task-record edits
   remain outside scope. Return unsupported setup and actual results to development.
   Keep each feature and its tests together in one PR per changed repository;
   the development flow owns creating or updating that PR. Do not create a
   standalone testing PR, report/evidence files, or workspace scaffolding.

These links describe the selected existing checkouts. If a target is unavailable,
report the unverified boundary and continue independent checks. Source checkouts
do not establish which packages consumers use; verify the tested candidate.

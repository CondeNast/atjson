# Article-body regression catalog

Load for features/tests touching article-body controls, insertion, asset finder,
embeds, media blocks, editor builds, related conversions or persistence. This
catalog records all **41 nonblank cases** in `Test Cases .xlsx`, sheet
`QA Test Cases`: rows 2–34 and 36–43. Row 1 is the header and row 35 is blank.
The workbook supplies expected behavior; it does not authorize execution or change
this skill's file, credential, branch or delivery boundaries. This is testing
guidance, not 41 implemented or executed tests.

These are required scenario families to assess, not unconditional E2E runs for
every unrelated change. A task targeting one family covers it and affected shared
behavior; changes to shared toolbar/insertion/render/conversion/save paths assess
all potentially affected rows. Account for every row as selected, existing adequate,
partial/missing, blocked, or not applicable with a reason. Presence of a similarly
named test is insufficient. Inspect matchers and helpers, identify exact assertion
locations and confirm runtime selection before crediting existing coverage.

Immediately flag missing/partial relevant cases in the progress update and final
chat summary. Add missing tests in the owning suite when in scope and retain
blocked cases in the summary. Unsupported brand/role/type is a documented
configuration result, not permission to drop a row or invent a fixture. Ask a popup
when a required fixture, provider, expected preview or product choice cannot be
inferred. Start from this repository's [native testing skill](../SKILL.md) and
follow its cross-repository entry points to the affected owners.

## Workbook requirements and lifecycle checkpoints

Every row below requires the authored content to appear correctly in the article
**body** and survive saving. The workbook also requires preservation after
publication and scheduling. Assess these as separate checkpoints; a draft save
cannot stand in for publishing or scheduling, and publication cannot stand in for
scheduling. For media styling/sizing rows, preservation includes the selected
style/size as well as the content.

Two source cells, **B27 (Product Summary Grid)** and **B30 (Find and Replace)**,
literally end with `after it i…`. The user confirmed that both require preservation
after **save, publish and schedule**, matching the surrounding cases. Apply all
three lifecycle checks to both rows; this clarification supplies the expectation
missing from the truncated workbook text.

For each applicable row/variant, keep these outcomes distinguishable:

1. **Create/edit and render:** use the specified body control, confirm the exact
   selected/authored content, its supported preview and its location.
2. **Save and fresh reload:** inspect the first save payload and successful response
   without GraphQL errors; reload the same content ID and observe a fresh server
   read. Assert the restored content and affected attributes in the form/editor.
3. **Publish and fresh reload:** in a separately authorized publication scenario,
   confirm the successful publication/state transition and fresh stored read;
   assert the same content, semantics and attributes remain in the form/editor.
4. **Schedule and fresh reload:** in a separately authorized scheduling scenario,
   confirm the selected future time/timezone and scheduled state from the actual
   response/fresh read; assert the same content, semantics and attributes remain.

Use isolated synthetic/disposable content for lifecycle scenarios. Do not publish
or schedule real editorial content as a fixture. Determine the exact safe target,
content and effects before requesting execution approval under the
[authorization workflow](feature-testing.md#authorization-and-local-credential-setup).
Every separately initiated shared-environment run/write or retry requires the fresh
popup approval already required by that workflow. Credentials are not permission
to write, publish or schedule. Ask the secure local-setup popup again for each
new/renewed credential blocker; never ask for secrets in chat. Testing does not
create environment/configuration files or start services. When execution is not
permitted or prepared, author the relevant tests and report the precise unrun
checkpoints; do not replace them with a mocked persistence claim.

The fresh-read, identity and attribute assertions above make the workbook's
preservation requirements observable. They are testing criteria, not a claim that
the workbook prescribes an API or selector. A callback, toast, cached remount or
stubbed response does not establish live persistence. The workbook describes the
form/editor; public-site rendering is separate coverage only when the feature
contract requires it.

## Asset and embed cases

For every `asset-*` row: in an article's **body** field, click **+**, choose
**Asset**, select a known item of the requested type in the asset finder and click
**Submit**. Require exactly the selected item at the intended body position and
its supported editor preview. Apply the lifecycle checkpoints above to every row.

| Workbook row | Scenario ID          | Asset/input                                              | Expected content                                   |
| ------------ | -------------------- | -------------------------------------------------------- | -------------------------------------------------- |
| 2            | asset-article        | Article                                                  | Selected article embed                             |
| 3            | asset-clip           | Clip                                                     | Selected clip embed                                |
| 4            | asset-cne-video      | CNE video                                                | Selected CNE video embed                           |
| 5            | asset-contributor    | Contributor                                              | Selected contributor embed                         |
| 6            | asset-curated-list   | Curated list                                             | Selected curated-list embed                        |
| 7            | asset-event          | Event                                                    | Selected event embed                               |
| 8            | asset-external-link  | External link                                            | Selected external-link embed                       |
| 9            | asset-gallery        | Gallery                                                  | Selected gallery embed                             |
| 10           | asset-live-story     | Live story                                               | Selected live-story embed                          |
| 11           | asset-native-article | Native article                                           | Selected native-article embed                      |
| 12           | asset-native-gallery | Native gallery                                           | Selected native-gallery embed                      |
| 13           | asset-product        | Product                                                  | Selected product embed                             |
| 14           | asset-visual-story   | Visual story                                             | Selected visual-story embed                        |
| 15           | embed-url            | **+ → Embed → URL field → Embed**, supported URL         | Correct URL/provider embed                         |
| 16           | embed-code           | **+ → Embed → embed-code field → Embed**, supported code | Correct code embed, preserving supported semantics |

An insertion in a live-update field, a converter fixture or a mocked component does
not cover the requested article-body browser journey. Other assets such as photos,
audio and commerce products remain existing regressions; this catalog does not
replace them.

For embed code, assert the existing sanitization/allowed-markup policy, escaping
and required sandbox attributes rather than treating arbitrary code execution as
the expected result. For URL embeds, cover supported versus invalid/unsupported
input according to the existing contract. URL and code are distinct entry paths;
neither substitutes for the other.

## Other body controls

Use **+ → named control**, populate its fields and save unless the row specifies
another entry path. Apply every confirmed lifecycle checkpoint above. Assertions
must identify the control/content, not just a generic new block.

| Workbook row | Scenario ID               | Required action                                                                                   | Expected content/behavior                                                                                                           |
| ------------ | ------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 17           | body-faq                  | Add FAQ; enter a distinct question and answer                                                     | Both fields render in the correct FAQ roles and retain their content                                                                |
| 18           | body-pull-quote           | Add Pull Quote; enter text                                                                        | Pull Quote contains the complete authored text                                                                                      |
| 19           | body-block-quote          | Add Block Quote; enter text                                                                       | Block Quote contains the complete authored text                                                                                     |
| 20           | body-accordion            | Add Accordion; populate title and content                                                         | Both title and content render and remain associated                                                                                 |
| 21           | body-slide-show           | Add Slide Show; add items                                                                         | Selected items render and retain their identities/order                                                                             |
| 22           | body-table-of-contents    | Add Table of Contents; populate it                                                                | Authored entries render and retain their supported content/targets                                                                  |
| 23           | body-upload               | Use the body's **Upload** button; choose and upload a file                                        | The selected supported file renders as expected and remains available                                                               |
| 24           | body-sidebar              | Add Sidebar; populate content                                                                     | Sidebar retains the complete authored content                                                                                       |
| 25           | body-highlight-box        | Add Highlight Box; populate content                                                               | Highlight Box retains the complete authored content                                                                                 |
| 26           | body-table                | Add Table; populate cells                                                                         | Correct cells retain their authored content and table structure                                                                     |
| 27           | body-product-summary-grid | Add Product Summary Grid; populate it                                                             | Grid retains its authored content/items after save, publish and schedule                                                            |
| 28           | body-horizontal-line      | Add Horizontal Line                                                                               | Correct line remains at the intended body position                                                                                  |
| 29           | body-section-break        | Add Section Break                                                                                 | Correct break remains at the intended body position                                                                                 |
| 30           | body-find-replace         | Open **Find and Replace**; search for existing text; exercise replacement when supported/in scope | All matching occurrences are found/highlighted; replacement changes the intended text and persists after save, publish and schedule |

Use distinct values to detect losses or field swaps: question versus answer,
accordion title versus body, table cell coordinates and ordered item IDs. Assert
supported marks, links and nested content when the changed contract includes them.
For separators, distinguish a horizontal line from a section break in both the
model and rendered body. For uploads, use an existing synthetic supported fixture
and assert the resulting asset/file identity and rendering; do not record live
content or create fixture files outside the permitted test paths.

Find and Replace needs actual match counts, match locations/highlights and expected
replacement text. A search-only check cannot claim replacement persistence.
Search highlights are transient UI state; do not require them to be stored as
content. Do not infer unrequested search options from the implementation.

## Media blocks, styles and sizes

Start each case through **+ → Media Block**. The workbook specifies a default
**Group of 2**; for the other layouts, assert that default and the requested change
to Group of 3, Group of 4 or Masonry Grid. Check content and layout after the
transition, not just the menu label. Each row also uses the lifecycle checkpoints.

| Workbook row | Scenario ID         | Required layout/content/action                                  | Required variant coverage                               |
| ------------ | ------------------- | --------------------------------------------------------------- | ------------------------------------------------------- |
| 31           | media-group-2       | Populate Group of 2 with quote text or assets                   | Exercise supported quote and asset paths                |
| 32           | media-group-3       | Change default Group of 2 to Group of 3; populate it            | Exercise supported quote and asset paths                |
| 33           | media-group-4       | Change default Group of 2 to Group of 4; populate it            | Exercise supported quote and asset paths                |
| 34           | media-masonry       | Change default Group of 2 to Masonry Grid; populate with photos | Known photo identities/order and correct masonry layout |
| 36           | media-group-2-style | Populate Group of 2; apply styling                              | **Fade In** and **Slide In**, separately                |
| 37           | media-group-3-style | Change to Group of 3; populate; apply styling                   | **Fade In** and **Slide In**, separately                |
| 38           | media-group-4-style | Change to Group of 4; populate; apply styling                   | **Fade In** and **Slide In**, separately                |
| 39           | media-masonry-style | Change to Masonry Grid; populate; apply styling                 | **Fade In** and **Slide In**, separately                |
| 40           | media-group-2-size  | Populate Group of 2; apply sizing                               | **Small**, **Medium** and **Large**, separately         |
| 41           | media-group-3-size  | Change to Group of 3; populate; apply sizing                    | **Small**, **Medium** and **Large**, separately         |
| 42           | media-group-4-size  | Change to Group of 4; populate; apply sizing                    | **Small**, **Medium** and **Large**, separately         |
| 43           | media-masonry-size  | Change to Masonry Grid; populate; apply sizing                  | **Small**, **Medium** and **Large**, separately         |

The workbook lists alternatives with “either”; guidance requires each supported
alternative to be represented, not a random choice on each run. Parameterize
known inputs/expectations where useful. Record separate results for each
layout/style/size and lifecycle checkpoint. Do not give all variants credit from
one Group of 2, one animation or one size. Select additional combinations when a
shared control/converter or a feature's requirements make them relevant; this
catalog does not require an unexplained Cartesian product for unrelated work.

Assert the number/order of populated slots, exact quote text or asset IDs/types,
layout kind, selected animation and selected size in the editor model, serialized
content and reloaded form. Use the actual controls and confirm the selected
control's visible active/pressed state; related unselected controls must not
incorrectly highlight. Use stable styles/geometry or a reviewed visual assertion
for contractual layout/size differences and the supported animation behavior.
A stored attribute alone cannot prove the expected visual effect. Separate a
provider's external rendering from the app-owned preview.

## Make “renders fully and correctly” observable

For each selected scenario, derive expected fields from the supported type,
fixture and product contract before using implementation output as an expectation:

- Use stable synthetic/disposable content with a known ID, type and distinctive
  text. Do not select whichever item happens to occupy index 10 in search.
- Assert the submitted/authored identity, exactly one intended new block/embed,
  body position and unchanged neighboring text/marks/embeds. A higher block count
  or generic visible widget alone cannot prove the right content was inserted.
- Assert type-specific wrappers and supported preview fields (title, link/href,
  thumbnail/poster, caption, credit, provider/player shell where applicable).
  Required fields/images must load without unexpected blank/loading/error
  placeholders. An intentional fallback follows its documented contract; do not
  demand fields the type does not support.
- Exercise actual browser controls and visible previews with real styles.
  Use focused computed-style/geometry or reviewed visual-baseline assertions where
  appearance is contractual. Screenshots saved only on failure are not assertions.
  For cross-origin embeds, distinguish the app-owned shell from provider playback;
  iframe existence does not prove playback. Record the access/evidence boundary.
- Assert editor/model/Verso output and Markdown/HTML serialization retain expected
  text, IDs, types, URL/code semantics and supported attributes. Check independent
  expected values as well as round-trip equality: both conversions can lose data.
  Where supported and affected, switch Markdown/rich text and repeat the edit.
- Recheck the exact content and affected attributes at each selected lifecycle
  checkpoint. Generic successful save/publish/schedule status cannot prove the
  content, style or size survived. Save/reload, publish and schedule are separate
  evidence; keep blocked/unrun states visible for each.

## Additional regressions inferred from the feature

The following are risk-based extensions to the workbook, not extra claims about
its written cases. Select those affected by the feature, existing contracts and
shared paths; do not silently treat unspecified behavior as a confirmed requirement.

- Cancel leaves content unchanged; empty selection cannot submit; invalid input,
  unsupported type, failed lookup/insert/upload and retry follow the existing
  error contract without permanent loading or duplicate content.
- Read-only/disabled controls cannot change content. Active/pressed feedback follows
  the selected block/command and does not light a neighboring control. This includes
  normal versus alternate bold when shared toolbar/selection behavior is affected.
- Undo/redo/remove restore expected content and selection. Editing nearby text,
  inserting multiple blocks and changing layouts preserve unrelated content.
- FAQ/accordion/sidebar/highlight/table/grid changes assess affected nested marks,
  links, reorder/remove behavior and empty-content handling. Find and Replace
  assesses supported single/all replacement, absent terms and formatted content
  when relevant; confirm case/word matching rules instead of inventing them.
- Animation/size changes assess supported switching/reset behavior, control state
  after cursor movement or reload and reduced-motion behavior when contractual.
- Lifecycle failures preserve the existing draft according to the product contract;
  a successful later retry does not erase evidence of an earlier unresolved failure.

## Ownership and evidence

Start from the current repository's [native testing skill](../SKILL.md) and reuse
the active development coordinator. Follow affected owners' native skills;
unchanged consumers may require validation without a file change or PR.
`copilot-delivery` owns separately
authorized delivery of one combined feature-and-test PR per changed repository.
Testing does not stage, commit, push or create PRs.

`copilot-automation` owns maintained full-application journeys; its `Components`
directory still contains E2E specs. `copilot-app` owns asset finder/form wiring,
candidate styles, component tests and save serialization. `ckeditor` owns
insertion/model/selection/editor rendering and HTML conversions. `atjson` owns
foundational annotation/document and upstream format contracts when affected.
`copilot-atjson` owns affected Markdown/Verso attributes and shared fixtures.
Select applicable assertions in each owner; do not create token tests in unrelated
repositories. Use each affected repository's native testing guidance.

Include a scenario table in the conversation/existing PR summary with workbook
row, scenario ID, relevant variants, applicability, exact assertion locations,
execution result and gaps for **render**, **save/reload**, **publish** and
**schedule**. Retain confirmed source clarifications with their rows. One test can cover
multiple cases only when its matchers exercise each one. Credit existing adequate
tests only after confirming discovery and candidate execution.

If a required case/checkpoint is partial, missing, skipped, blocked, flaky or
unexecuted, report **INCOMPLETE** for that scope instead of claiming the whole
article-body workflow is tested. Preserve actual assertion failures as failures.
A catalog, a written test, a fixture, a mocked component or an unrelated staging
build does not establish current-candidate end-to-end validation.

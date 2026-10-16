# Article-body asset and embed regression catalog

Load for features/tests touching article-body insertion, asset finder, embed
rendering, editor builds, related conversions or saving that content. These are
required scenario families to assess, not fifteen unconditional E2E runs for every
unrelated change. A task targeting a single family covers that family plus affected
shared behavior; changes to the shared insertion/render/save path assess all rows.
Account for every row as selected, existing adequate, partial/missing, blocked, or
not applicable with a reason. Presence of a similarly named test is insufficient.

Do not claim these cases exist merely because this catalog exists. Inspect current
tests and their helpers; record exact assertion locations and runtime selection.
Immediately flag missing/partial relevant cases in the progress update and final
chat summary, add tests in the owning suite when in scope, and retain blocked cases in
the testing summary. Unsupported brand/role/type is a documented configuration result,
not permission to drop the row or invent a fixture. Ask a popup when a required
fixture, provider, expected preview or product choice cannot be inferred.

## Required journeys

For every `asset-*` row: in an article's **body** field, click **+**, choose
**Asset**, select a known item of the requested type in the asset finder and click
**Submit**. Require exactly the selected item to appear at the intended body
position and render according to that type's supported editor preview contract.

| Scenario ID          | Asset/input                                                  | Expected inserted content                          |
| -------------------- | ------------------------------------------------------------ | -------------------------------------------------- |
| asset-article        | Article                                                      | Selected article embed                             |
| asset-clip           | Clip                                                         | Selected clip embed                                |
| asset-cne-video      | CNE video                                                    | Selected CNE video embed                           |
| asset-contributor    | Contributor                                                  | Selected contributor embed                         |
| asset-curated-list   | Curated list                                                 | Selected curated-list embed                        |
| asset-event          | Event                                                        | Selected event embed                               |
| asset-external-link  | External link                                                | Selected external-link embed                       |
| asset-gallery        | Gallery                                                      | Selected gallery embed                             |
| asset-live-story     | Live story                                                   | Selected live-story embed                          |
| asset-native-article | Native article                                               | Selected native-article embed                      |
| asset-native-gallery | Native gallery                                               | Selected native-gallery embed                      |
| asset-product        | Product                                                      | Selected product embed                             |
| asset-visual-story   | Visual story                                                 | Selected visual-story embed                        |
| embed-url            | **+ → Embed → URL field → Embed** with a supported URL       | Correct URL/provider embed                         |
| embed-code           | **+ → Embed → embed-code field → Embed** with supported code | Correct code embed, preserving supported semantics |

An insertion in a live-update field, a converter fixture, or a mocked component
does not cover the requested article-body browser journey. Other assets such as
photos, audio and commerce products remain existing regressions; this minimum
catalog does not replace them.

## Make “renders fully and correctly” observable

For each selected scenario, establish expected fields from the supported type,
fixture and product contract before using the implementation output as a value:

- Use stable synthetic/disposable content with a known ID, type and distinctive
  title/text. Do not select whichever item happens to occupy index 10 in search.
- Assert the finder selection and submitted identity, exactly one intended new
  embed, body position and unchanged neighboring text/marks/embeds. A higher block
  count or generic visible widget alone cannot prove the right asset was inserted.
- Assert the type-specific wrapper and authored preview fields (title, link/href,
  thumbnail/poster, caption, credit, provider/player shell where applicable).
  Confirm required fields/images have loaded and no unexpected blank/loading/error
  placeholder remains. An intentional fallback is tested against its documented
  contract. Do not require fields the type does not support.
- Exercise the actual browser control and visible preview with real styles.
  Use a focused computed-style/geometry or reviewed visual-baseline check where
  appearance is contractual; screenshots saved only on failure are not assertions.
  For cross-origin providers, separate the app-owned embed shell from provider
  playback; external playback may require its own target/access and is not implied
  by iframe existence. Record that boundary.
- Assert editor/model/Verso output and Markdown/HTML serialization retain the ID,
  type, URL/code semantics and affected supported attributes. Assert independent
  expected text/attributes in addition to equality after conversion out and back.
- For affected persistent content, check the **first** save payload, successful
  response without GraphQL errors, same content ID, fresh server read after page
  reload and restored rendered semantics. A toast, callback or remount is not a
  storage check. Where supported, switch Markdown/rich text and repeat the edit.
- Add relevant negative/adjacent regressions: cancel leaves content unchanged,
  empty selection cannot submit, wrong/unsupported type is handled, failed lookup
  or insert stops loading with a useful error, retry avoids duplicates, read-only
  does not change content, and undo/redo/remove restore the expected state.

For embed code, assert the existing sanitization/allowed-markup policy, escaping
and required sandbox attributes, rather than accepting arbitrary code execution
as the desired result. For URL embeds, cover supported versus invalid/unsupported
input according to the existing contract. URL and code are distinct entry paths;
neither substitutes for the other.

## Ownership and evidence

`copilot-automation` owns the maintained full-application journeys; its `Components`
directory still contains E2E specs. `copilot-app` owns asset finder/form wiring,
candidate styles, app component tests and save serialization. `ckeditor` owns
insertion/model/selection/editor rendering and HTML conversions. `atjson` owns foundational annotation/document and upstream format contracts when
affected. `copilot-atjson`
owns affected Markdown/Verso attributes and shared fixtures. Select applicable
assertions in each owner; do not create token tests in unrelated repositories.

Include a scenario table with ID, applicability/coverage, assertion/check IDs and
result/gap in the conversation/existing PR summary. A check can cover multiple scenarios only when its
assertions actually exercise each one. If a required scenario remains partial,
missing, skipped, blocked or unexecuted, report INCOMPLETE instead of describing
the whole asset workflow as tested. Existing adequate tests may be reused after
verifying discovery and candidate execution.

import HTMLSource from "../src";
import OffsetSource from "@atjson/offset-annotations";
import { serialize } from "@atjson/document";

describe("TiktokEmbed", () => {
  test("from embed dialog", () => {
    let doc = HTMLSource.fromRaw(
      `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@teenvogue/video/7361091431944965419" data-video-id="7361091431944965419" style="max-width: 605px;min-width: 325px;" > <section> <a target="_blank" title="@teenvogue" href="https://www.tiktok.com/@teenvogue?refer=embed">@teenvogue</a> The Swish Alps emoji is sending me 😭 The cast of RuPaul’s Drag Race S16 describe the season in 3 emojis 🪩 <a title="rupaul" target="_blank" href="https://www.tiktok.com/tag/rupaul?refer=embed">#rupaul</a> <a title="rupaulsdragrace" target="_blank" href="https://www.tiktok.com/tag/rupaulsdragrace?refer=embed">#rupaulsdragrace</a> <a title="drag" target="_blank" href="https://www.tiktok.com/tag/drag?refer=embed">#drag</a> <a title="dragqueen" target="_blank" href="https://www.tiktok.com/tag/dragqueen?refer=embed">#dragqueen</a> <a target="_blank" title="♬ Trilha de Desfile - Beatdohostil" href="https://www.tiktok.com/music/Trilha-de-Desfile-7268337112642193410?refer=embed">♬ Trilha de Desfile - Beatdohostil</a> </section> </blockquote> <script async src="https://www.tiktok.com/embed.js"></script>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "content": "M00000000",
              "url": "https://www.tiktok.com/@teenvogue/video/7361091431944965419",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "tiktok-embed",
          },
          {
            "attributes": {},
            "id": "B00000001",
            "parents": [
              "tiktok-embed",
            ],
            "selfClosing": false,
            "type": "text",
          },
        ],
        "marks": [
          {
            "attributes": {
              "refs": [
                "B00000000",
              ],
            },
            "id": "M00000000",
            "range": "(2..200]",
            "type": "slice",
          },
          {
            "attributes": {
              "target": "_blank",
              "title": "@teenvogue",
              "url": "https://www.tiktok.com/@teenvogue?refer=embed",
            },
            "id": "M00000001",
            "range": "(3..13)",
            "type": "link",
          },
          {
            "attributes": {
              "target": "_blank",
              "title": "rupaul",
              "url": "https://www.tiktok.com/tag/rupaul?refer=embed",
            },
            "id": "M00000002",
            "range": "(122..129)",
            "type": "link",
          },
          {
            "attributes": {
              "target": "_blank",
              "title": "rupaulsdragrace",
              "url": "https://www.tiktok.com/tag/rupaulsdragrace?refer=embed",
            },
            "id": "M00000003",
            "range": "(130..146)",
            "type": "link",
          },
          {
            "attributes": {
              "target": "_blank",
              "title": "drag",
              "url": "https://www.tiktok.com/tag/drag?refer=embed",
            },
            "id": "M00000004",
            "range": "(147..152)",
            "type": "link",
          },
          {
            "attributes": {
              "target": "_blank",
              "title": "dragqueen",
              "url": "https://www.tiktok.com/tag/dragqueen?refer=embed",
            },
            "id": "M00000005",
            "range": "(153..163)",
            "type": "link",
          },
          {
            "attributes": {
              "target": "_blank",
              "title": "♬ Trilha de Desfile - Beatdohostil",
              "url": "https://www.tiktok.com/music/Trilha-de-Desfile-7268337112642193410?refer=embed",
            },
            "id": "M00000006",
            "range": "(164..198)",
            "type": "link",
          },
        ],
        "text": "￼￼ @teenvogue The Swish Alps emoji is sending me 😭 The cast of RuPaul’s Drag Race S16 describe the season in 3 emojis 🪩 #rupaul #rupaulsdragrace #drag #dragqueen ♬ Trilha de Desfile - Beatdohostil  ",
      }
    `);
  });

  test("from html rendered output", () => {
    let doc = HTMLSource.fromRaw(
      `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@teenvogue/video/292170367534714880" data-video-id="292170367534714880" style="max-width: 605px;min-width: 325px;"><section><a target="_blank" title="@teenvogue" href="https://www.tiktok.com/@teenvogue">@teenvogue</a></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "content": "M00000001",
              "url": "https://www.tiktok.com/@teenvogue/video/292170367534714880",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "tiktok-embed",
          },
          {
            "attributes": {},
            "id": "B00000001",
            "parents": [
              "tiktok-embed",
            ],
            "selfClosing": false,
            "type": "text",
          },
        ],
        "marks": [
          {
            "attributes": {
              "target": "_blank",
              "title": "@teenvogue",
              "url": "https://www.tiktok.com/@teenvogue",
            },
            "id": "M00000000",
            "range": "(2..12)",
            "type": "link",
          },
          {
            "attributes": {
              "refs": [
                "B00000000",
              ],
            },
            "id": "M00000001",
            "range": "(2..12]",
            "type": "slice",
          },
        ],
        "text": "￼￼@teenvogue",
      }
    `);
  });
});

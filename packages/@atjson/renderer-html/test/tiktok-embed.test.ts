import OffsetSource, { TikTokEmbed } from "@atjson/offset-annotations";
import { ParseAnnotation } from "@atjson/document";
import Renderer from "../src";

describe("TiktokEmbed", () => {
  test("no content", () => {
    let doc = new OffsetSource({
      content: "\uFFFC",
      annotations: [
        new TikTokEmbed({
          start: 0,
          end: 1,
          attributes: {
            url: "https://www.tiktok.com/@vogueitalia/video/6771026615137750277",
          },
        }),
        new ParseAnnotation({
          start: 0,
          end: 1,
        }),
      ],
    });

    expect(Renderer.render(doc)).toEqual(
      `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@vogueitalia/video/6771026615137750277" data-video-id="6771026615137750277" style="max-width: 605px;min-width: 325px;"><section><a target="_blank" title="@vogueitalia" href="https://www.tiktok.com/@vogueitalia">@vogueitalia</a></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script>`
    );
  });

  test("with content", () => {
    expect(
      Renderer.render({
        blocks: [
          {
            attributes: {
              content: "M00000000",
              url: "https://www.tiktok.com/@teenvogue/video/7361091431944965419",
            },
            id: "B00000000",
            parents: [],
            selfClosing: false,
            type: "tiktok-embed",
          },
          {
            attributes: {},
            id: "B00000001",
            parents: ["tiktok-embed"],
            selfClosing: false,
            type: "text",
          },
        ],

        marks: [
          {
            attributes: {
              refs: ["B00000000"],
            },
            id: "M00000000",
            range: "(2..200]",
            type: "slice",
          },
          {
            attributes: {
              target: "_blank",
              title: "@teenvogue",
              url: "https://www.tiktok.com/@teenvogue?refer=embed",
            },
            id: "M00000001",
            range: "(3..13)",
            type: "link",
          },
          {
            attributes: {
              target: "_blank",
              title: "rupaul",
              url: "https://www.tiktok.com/tag/rupaul?refer=embed",
            },
            id: "M00000002",
            range: "(122..129)",
            type: "link",
          },
          {
            attributes: {
              target: "_blank",
              title: "rupaulsdragrace",
              url: "https://www.tiktok.com/tag/rupaulsdragrace?refer=embed",
            },
            id: "M00000003",
            range: "(130..146)",
            type: "link",
          },
          {
            attributes: {
              target: "_blank",
              title: "drag",
              url: "https://www.tiktok.com/tag/drag?refer=embed",
            },
            id: "M00000004",
            range: "(147..152)",
            type: "link",
          },
          {
            attributes: {
              target: "_blank",
              title: "dragqueen",
              url: "https://www.tiktok.com/tag/dragqueen?refer=embed",
            },
            id: "M00000005",
            range: "(153..163)",
            type: "link",
          },
          {
            attributes: {
              target: "_blank",
              title: "♬ Trilha de Desfile - Beatdohostil",
              url: "https://www.tiktok.com/music/Trilha-de-Desfile-7268337112642193410?refer=embed",
            },
            id: "M00000006",
            range: "(164..198)",
            type: "link",
          },
        ],

        text: "￼￼ @teenvogue The Swish Alps emoji is sending me 😭 The cast of RuPaul’s Drag Race S16 describe the season in 3 emojis 🪩 #rupaul #rupaulsdragrace #drag #dragqueen ♬ Trilha de Desfile - Beatdohostil  ",
      })
    ).toMatchInlineSnapshot(
      `"<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@teenvogue/video/7361091431944965419" data-video-id="7361091431944965419" style="max-width: 605px;min-width: 325px;"><section> <a href="https://www.tiktok.com/@teenvogue?refer=embed" title="@teenvogue" target="_blank">@teenvogue</a> The Swish Alps emoji is sending me &#x1f62d; The cast of RuPaul&#x2019;s Drag Race S16 describe the season in 3 emojis &#x1faa9; <a href="https://www.tiktok.com/tag/rupaul?refer=embed" title="rupaul" target="_blank">#rupaul</a> <a href="https://www.tiktok.com/tag/rupaulsdragrace?refer=embed" title="rupaulsdragrace" target="_blank">#rupaulsdragrace</a> <a href="https://www.tiktok.com/tag/drag?refer=embed" title="drag" target="_blank">#drag</a> <a href="https://www.tiktok.com/tag/dragqueen?refer=embed" title="dragqueen" target="_blank">#dragqueen</a> <a href="https://www.tiktok.com/music/Trilha-de-Desfile-7268337112642193410?refer=embed" title="&#x266c; Trilha de Desfile - Beatdohostil" target="_blank">&#x266c; Trilha de Desfile - Beatdohostil</a>  </section></blockquote><script async src="https://www.tiktok.com/embed.js"></script>"`
    );
  });
});

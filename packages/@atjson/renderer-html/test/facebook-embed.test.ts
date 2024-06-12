import OffsetSource, { FacebookEmbed } from "@atjson/offset-annotations";
import { ParseAnnotation } from "@atjson/document";
import Renderer from "../src";

describe("FacebookEmbed", () => {
  test("no content", () => {
    let doc = new OffsetSource({
      content: "\uFFFC",
      annotations: [
        new FacebookEmbed({
          start: 0,
          end: 1,
          attributes: {
            url: "https://www.facebook.com/BeethovenOfficialPage/posts/2923157684380743",
          },
        }),
        new ParseAnnotation({
          start: 0,
          end: 1,
        }),
      ],
    });

    expect(Renderer.render(doc)).toEqual(
      `<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FBeethovenOfficialPage%2Fposts%2F2923157684380743&width=500" width="500" height="633" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true" allow="encrypted-media"></iframe>`
    );
  });

  test("with content", () => {
    expect(
      Renderer.render({
        blocks: [
          {
            attributes: {
              content: "M00000000",
              hideText: false,
              url: "https://www.facebook.com/BeethovenOfficialPage/posts/2923157684380743",
            },
            id: "B00000000",
            parents: [],
            selfClosing: false,
            type: "facebook-embed",
          },
          {
            attributes: {},
            id: "B00000001",
            parents: ["facebook-embed"],
            selfClosing: true,
            type: "line-break",
          },
        ],
        marks: [
          {
            attributes: {
              refs: ["B00000000"],
            },
            id: "M00000000",
            range: "(1..119]",
            type: "slice",
          },
          {
            attributes: {
              url: "https://www.facebook.com/BeethovenOfficialPage/",
            },
            id: "M00000001",
            range: "(69..89)",
            type: "link",
          },
          {
            attributes: {
              url: "https://developers.facebook.com/BeethovenOfficialPage/posts/2923157684380743",
            },
            id: "M00000002",
            range: "(93..119)",
            type: "link",
          },
        ],
        text: `\uFFFCNext stop of the exhibition "BTHVN on Tour" is in Boston!\uFFFCPosted by Ludwig van Beethoven on\u00a0Thursday, October 24, 2019`,
      })
    ).toMatchInlineSnapshot(
      `"<div class="fb-post" data-href="https://www.facebook.com/BeethovenOfficialPage/posts/2923157684380743" data-show-text><blockquote class="fb-xfbml-parse-ignore" cite="https://www.facebook.com/BeethovenOfficialPage/posts/2923157684380743"><br />Posted by Ludwig van Beethoven on&#xa0;Thursday, October 24, 2019</blockquote></div>"`
    );
  });
});

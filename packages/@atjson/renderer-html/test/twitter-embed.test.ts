import OffsetSource, { TwitterEmbed } from "@atjson/offset-annotations";
import { ParseAnnotation } from "@atjson/document";
import Renderer from "../src";

describe("TwitterEmbed", () => {
  test("no content", () => {
    let doc = new OffsetSource({
      content: "\uFFFC",
      annotations: [
        new TwitterEmbed({
          start: 0,
          end: 1,
          attributes: {
            url: "https://twitter.com/nycgov/status/1191528054608334848",
          },
        }),
        new ParseAnnotation({
          start: 0,
          end: 1,
        }),
      ],
    });

    expect(Renderer.render(doc)).toEqual(
      `<blockquote class="twitter-embed"><p><a href="https://twitter.com/nycgov/status/1191528054608334848">https://twitter.com/nycgov/status/1191528054608334848</a></p></blockquote><script async src="https://www.tiktok.com/embed.js"></script>`
    );
  });

  test("with content", () => {
    expect(
      Renderer.render({
        blocks: [
          {
            attributes: {
              content: "M00000000",
              url: "https://twitter.com/nycgov/status/1191528054608334848",
            },
            id: "B00000000",
            parents: [],
            selfClosing: false,
            type: "twitter-embed",
          },
          {
            attributes: {},
            id: "B00000001",
            parents: ["twitter-embed"],
            selfClosing: false,
            type: "text",
          },
          {
            attributes: {},
            id: "B00000001",
            parents: ["twitter-embed", "text"],
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
            range: "(1..130]",
            type: "slice",
          },
          {
            attributes: {
              url: "https://t.co/9skas4Bady",
            },
            id: "M00000001",
            range: "(58..84)",
            type: "link",
          },
          {
            attributes: {
              url: "https://twitter.com/nycgov/status/1191528054608334848?ref_src=twsrc^tfw",
            },
            id: "M00000002",
            range: "(114..130)",
            type: "link",
          },
        ],

        text: "￼￼Hope you had a great start to your week, New York City! pic.twitter.com/9skas4Bady￼— City of New York (@nycgov) November 5, 2019",
      })
    ).toMatchInlineSnapshot(
      `"<blockquote class="twitter-embed"><p>Hope you had a great start to your week, New York City! <a href="https://t.co/9skas4Bady">pic.twitter.com/9skas4Bady</a><br />— City of New York (@nycgov) <a href="https://twitter.com/nycgov/status/1191528054608334848?ref_src=twsrc%5Etfw">November 5, 2019</a></p></blockquote><script async src="https://www.tiktok.com/embed.js"></script>"`
    );
  });
});

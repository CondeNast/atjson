import HTMLSource from "../src";
import OffsetSource from "@atjson/offset-annotations";
import { serialize } from "@atjson/document";

describe("MastodonEmbed", () => {
  test.each([
    [
      "https://mastodon.social/@arstechnica/112441115030608987",
      `<iframe src="https://mastodon.social/@arstechnica/112441115030608987/embed" class="mastodon-embed" style="max-width: 100%; border: 0" width="400" allowfullscreen="allowfullscreen"></iframe><script src="https://mastodon.social/embed.js" async="async"></script>`,
    ],
    [
      "https://social.ridetrans.it/@JamieDay/112440841508955844",
      `<iframe src="https://social.ridetrans.it/@JamieDay/112440841508955844/embed" class="mastodon-embed" style="max-width: 100%; border: 0" width="400" allowfullscreen="allowfullscreen"></iframe><script src="https://social.ridetrans.it/embed.js" async="async"></script>`,
    ],
  ])("%s", (url, html) => {
    let doc = HTMLSource.fromRaw(html).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toEqual({
      blocks: [
        {
          attributes: {
            url,
          },
          id: "B00000000",
          parents: [],
          selfClosing: false,
          type: "mastodon-embed",
        },
      ],
      marks: [],
      text: "￼",
    });
  });
});

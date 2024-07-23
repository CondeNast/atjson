import OffsetSource, { MastodonEmbed } from "@atjson/offset-annotations";
import { ParseAnnotation } from "@atjson/document";
import Renderer from "../src";

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
    let doc = new OffsetSource({
      content: "\uFFFC",
      annotations: [
        new MastodonEmbed({
          start: 0,
          end: 1,
          attributes: {
            url,
          },
        }),
        new ParseAnnotation({
          start: 0,
          end: 1,
        }),
      ],
    });

    expect(Renderer.render(doc)).toEqual(html);
  });
});

import OffsetSource, { TikTokEmbed } from "@atjson/offset-annotations";
import { ParseAnnotation } from "@atjson/document";
import Renderer from "../src";

test("TiktokEmbed", () => {
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

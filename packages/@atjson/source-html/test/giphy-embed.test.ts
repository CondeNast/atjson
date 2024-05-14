import { serialize } from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import HTMLSource from "../src";

test("GiphyEmbed", () => {
  let doc = HTMLSource.fromRaw(
    `<iframe src="https://giphy.com/embed/13CoXDiaCcCoyk" width="480" height="398" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/wiggle-shaq-13CoXDiaCcCoyk">via GIPHY</a></p>`
  ).convertTo(OffsetSource);

  expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "attributes": {
            "height": "398",
            "url": "https://giphy.com/embed/13CoXDiaCcCoyk",
            "width": "480",
          },
          "id": "B00000000",
          "parents": [],
          "selfClosing": false,
          "type": "giphy-embed",
        },
      ],
      "marks": [],
      "text": "￼",
    }
  `);
});

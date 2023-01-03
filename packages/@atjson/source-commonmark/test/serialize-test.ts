import { serialize } from "@atjson/document";
import CommonMarkSource from "../src";
import Renderer from "@atjson/renderer-commonmark";
import OffsetSource from "@atjson/offset-annotations";

describe("stable serialization", () => {
  test("links / bold", () => {
    let doc = CommonMarkSource.fromRaw(
      "*[The Cook Up](https://open.spotify.com/show/5htkjDa5N8Eja6cbTn197S)*"
    );

    expect(serialize(doc, { withStableIds: true })).toMatchObject(
      serialize(
        CommonMarkSource.fromRaw(Renderer.render(doc.convertTo(OffsetSource))),
        {
          withStableIds: true,
        }
      )
    );
  });
});

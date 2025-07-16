import { serialize } from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import URLSource from "../src";

describe("ThreadsEmbed", () => {
  test.each([
    "https://www.threads.net/@voguemagazine/post/C6peyiQK22q",
    "https://www.threads.net/@wired/post/C7UFuM3gT9G",
    "https://www.threads.net/@voguefrance/post/C3GEEiEoIBo",
    "https://www.threads.net/@bbc/post/CuZrQ2osUpi",
  ])("%s", (url) => {
    expect(
      serialize(URLSource.fromRaw(url).convertTo(OffsetSource), {
        withStableIds: true,
      }),
    ).toEqual({
      text: "\uFFFC",
      blocks: [
        {
          id: "B00000000",
          type: "threads-embed",
          parents: [],
          selfClosing: false,
          attributes: {
            url,
          },
        },
      ],
      marks: [],
    });
  });
});

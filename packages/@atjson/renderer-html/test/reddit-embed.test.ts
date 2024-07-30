import OffsetSource, { RedditEmbed } from "@atjson/offset-annotations";
import { deserialize, AttributesOf } from "@atjson/document";
import Renderer from "../src";

function getEmbed(
  attributes: Omit<Omit<AttributesOf<RedditEmbed>, "content">, "url">
) {
  return deserialize(
    {
      blocks: [
        {
          attributes: {
            content: "M00000000",
            ...attributes,
            url: "https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/",
          },
          id: "B00000000",
          parents: [],
          selfClosing: false,
          type: "reddit-embed",
        },
        {
          attributes: {},
          id: "B00000001",
          parents: ["reddit-embed"],
          selfClosing: false,
          type: "text",
        },
        {
          attributes: {},
          id: "B00000002",
          parents: ["reddit-embed", "text"],
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
          range: "(1..65]",
          type: "slice",
        },
        {
          attributes: {
            url: "https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/",
          },
          id: "M00000001",
          range: "(2..28)",
          type: "link",
        },
        {
          attributes: {
            url: "https://www.reddit.com/user/the_ginger_one367/",
          },
          id: "M00000002",
          range: "(33..52)",
          type: "link",
        },
        {
          attributes: {
            url: "https://www.reddit.com/r/Eldenring/",
          },
          id: "M00000003",
          range: "(56..65)",
          type: "link",
        },
      ],
      text: "￼￼dude just slap me and left￼ by u/the_ginger_one367 in Eldenring",
    },
    OffsetSource
  );
}

describe("RedditEmbed", () => {
  test("rendering with standard options", () => {
    expect(
      Renderer.render(
        getEmbed({
          height: 546,
        })
      )
    ).toMatchInlineSnapshot(
      `"<blockquote class="reddit-embed-bq" style="height:500px" data-embed-height="546"><a href="https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/">dude just slap me and left</a><br /> by <a href="https://www.reddit.com/user/the_ginger_one367/">u/the_ginger_one367</a> in <a href="https://www.reddit.com/r/Eldenring/">Eldenring</a></blockquote><script async src="https://embed.reddit.com/widgets.js" charset="UTF-8"></script>"`
    );
  });

  test("hideUsername", () => {
    expect(
      Renderer.render(
        getEmbed({
          height: 546,
          hideUsername: true,
        })
      )
    ).toMatchInlineSnapshot(
      `"<blockquote class="reddit-embed-bq" style="height:500px" data-embed-height="546" data-embed-showusername="false"><a href="https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/">dude just slap me and left</a><br /> by <a href="https://www.reddit.com/user/the_ginger_one367/">u/the_ginger_one367</a> in <a href="https://www.reddit.com/r/Eldenring/">Eldenring</a></blockquote><script async src="https://embed.reddit.com/widgets.js" charset="UTF-8"></script>"`
    );
  });

  test("hidePostContent", () => {
    expect(
      Renderer.render(
        getEmbed({
          height: 240,
          hidePostContent: true,
        })
      )
    ).toMatchInlineSnapshot(
      `"<blockquote class="reddit-embed-bq" style="height:500px" data-embed-height="240" data-embed-showmedia="false"><a href="https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/">dude just slap me and left</a><br /> by <a href="https://www.reddit.com/user/the_ginger_one367/">u/the_ginger_one367</a> in <a href="https://www.reddit.com/r/Eldenring/">Eldenring</a></blockquote><script async src="https://embed.reddit.com/widgets.js" charset="UTF-8"></script>"`
    );
  });

  test("hide", () => {
    expect(
      Renderer.render(
        getEmbed({
          height: 546,
          hidePostContentIfEditedAfter: "2024-05-01T19:46:02.207Z",
        })
      )
    ).toMatchInlineSnapshot(
      `"<blockquote class="reddit-embed-bq" style="height:500px" data-embed-height="546" data-embed-showedits="false" data-embed-created="2024-05-01T19:46:02.207Z"><a href="https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/">dude just slap me and left</a><br /> by <a href="https://www.reddit.com/user/the_ginger_one367/">u/the_ginger_one367</a> in <a href="https://www.reddit.com/r/Eldenring/">Eldenring</a></blockquote><script async src="https://embed.reddit.com/widgets.js" charset="UTF-8"></script>"`
    );
  });
});

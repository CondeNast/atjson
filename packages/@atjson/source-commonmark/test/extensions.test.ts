import {
  InlineAnnotation,
  getConverterFor,
  is,
  serialize,
} from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import MarkdownIt from "markdown-it";
import CommonmarkSource from "../src";
import { render } from "./utils";

class StrikeThrough extends InlineAnnotation {
  static vendorPrefix = "commonmark";
  static type = "s";
}

class MarkdownItSource extends CommonmarkSource {
  static contentType = "application.vnd.atjson+markdownit";
  static schema = [...CommonmarkSource.schema, StrikeThrough];
  static get markdownParser() {
    return MarkdownIt();
  }
}

MarkdownItSource.defineConverterTo(OffsetSource, (doc) => {
  let convertCommonmark = getConverterFor(CommonmarkSource, OffsetSource);
  convertCommonmark(doc);
  doc.where({ type: "-commonmark-s" }).set({ type: "-offset-strikethrough" });

  return doc;
});

describe("strikethrough", () => {
  test("~~hello~~ is converted to strikethrough annotations", () => {
    let doc = MarkdownItSource.fromRaw("~~hello~~").withStableIds();
    expect(render(doc)).toBe("hello\n\n");
    let strikeThrough = doc.where((a) => is(a, StrikeThrough));
    expect(strikeThrough.toJSON()).toMatchInlineSnapshot(`
      [
        {
          "attributes": {},
          "end": 7,
          "id": "00000003",
          "start": 1,
          "type": "-commonmark-s",
        },
      ]
    `);
  });

  test("conversion to Offset uses existing conversions", () => {
    let doc = MarkdownItSource.fromRaw("~~hello~~ *world*")
      .convertTo(OffsetSource)
      .withStableIds();
    expect(
      doc
        .where((a) => a.type !== "parse-token")
        .sort()
        .toJSON()
    ).toMatchInlineSnapshot(`
      [
        {
          "attributes": {},
          "end": 14,
          "id": "00000001",
          "start": 0,
          "type": "-offset-paragraph",
        },
        {
          "attributes": {},
          "end": 7,
          "id": "00000003",
          "start": 1,
          "type": "-offset-strikethrough",
        },
        {
          "attributes": {},
          "end": 14,
          "id": "00000005",
          "start": 8,
          "type": "-offset-italic",
        },
      ]
    `);
  });
});

describe("tables", () => {
  const tableExample = `
| name     | age | job     | [*notes*](https://en.wikipedia.org/wiki/Delicious_in_Dungeon)                                                                                    |
|:-------- | ---:| ------- |:------------------------------------------------------------------------------------------------------------------------------------------------:|
| laios    | 20  | fighter | A strange but earnest person. He *really __really__* likes monsters                                                                              |
| marcille | 500 | mage    | Difficult to get along with but very competent. Despite seeming strict and fussy, she is interested in forbidden magic...                        |
| falin    | 18  | healer  | She *seems* nice, but is actually just a people pleaser. When push comes to shove she will look out for people she loves and disregard strangers |
| chilchuk | 29  | thief   | Looks like a child but is actually a divorced father of three. He is serious about his work and isn't interested in getting close with people    |
`;
  test("parsing", () => {
    expect(
      serialize(MarkdownItSource.fromRaw(tableExample), { withStableIds: true })
    ).toMatchSnapshot();
  });

  test("converting", () => {
    let doc = MarkdownItSource.fromRaw(tableExample).withStableIds();

    expect(
      serialize(doc.convertTo(OffsetSource), { withStableIds: true })
    ).toMatchSnapshot();
  });
});

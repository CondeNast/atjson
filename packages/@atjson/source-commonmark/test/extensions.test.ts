import {
  InlineAnnotation,
  getConverterFor,
  is,
  serialize,
} from "@atjson/document";
import OffsetSource, { Table } from "@atjson/offset-annotations";
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
| name     | age | job     | [*notes*](https://ja.wikipedia.org/wiki/ダンジョン飯)                                                                                    |
|:-------- | ---:| ------- |:------------------------------------------------------------------------------------------------------------------------------------------------:|
| laios    | 20  | fighter | ちょっと変な but earnest person. He *really __really__* likes monsters                                                                              |
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

  test("adjacent tables", () => {
    let doc = MarkdownItSource.fromRaw(
      tableExample + "\n" + tableExample
    ).withStableIds();

    expect(
      serialize(doc.convertTo(OffsetSource), { withStableIds: true })
    ).toMatchSnapshot();
  });

  test("empty header row creates headless table", () => {
    const headlessTableExample = `
|   |   |
| - | - |
| a | b |
| c | d |
`;
    let doc =
      MarkdownItSource.fromRaw(headlessTableExample).convertTo(OffsetSource);

    let tables = doc.where((annotation) => is(annotation, Table));

    expect(tables.length).toBe(1);

    tables.forEach((table) => {
      expect(table.attributes.showColumnHeaders).toBe(false);
    });
  });

  test("duplicate column headers produce distinct column names", () => {
    const duplicateColumnsTableExample = `
| head | head |
| ---- | ---- |
| 1,1  | 1,2  |
| 2,1  | 2,2  |
`;
    let doc = MarkdownItSource.fromRaw(duplicateColumnsTableExample).convertTo(
      OffsetSource
    );
    let tables = doc.where((annotation) => is(annotation, Table));

    expect(tables.length).toBe(1);

    let columnNames = tables.annotations[0].attributes.columns.map(
      (column) => column.columnName
    );

    expect(new Set(columnNames).size).toBe(2);
  });
});

describe("table with empty column header", () => {
  const tableExample = `
| name     | age | job     |                                                                                 |
|:-------- | ---:| ------- |:------------------------------------------------------------------------------------------------------------------------------------------------:|
| laios    | 20  | fighter | ちょっと変な but earnest person. He *really __really__* likes monsters                                                                              |
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

  test("adjacent tables", () => {
    let doc = MarkdownItSource.fromRaw(
      tableExample + "\n" + tableExample
    ).withStableIds();

    expect(
      serialize(doc.convertTo(OffsetSource), { withStableIds: true })
    ).toMatchSnapshot();
  });
});

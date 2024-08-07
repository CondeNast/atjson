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

describe("links around images", () => {
  test("are converted to attributes on the image when the link wraps a single image", () => {
    let doc = CommonmarkSource.fromRaw(
      `[![December 11, 1995 P. 41](https://static.cdn.realviewdigital.com/global/content/GetImage.aspx?pguid=FC9071DC-DD99-441F-A727-1B74670350BC&i=1995-12-11&folio=040)](http://archives.newyorker.com/?i=1995-12-11#folio=040)`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {},
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "paragraph",
          },
          {
            "attributes": {
              "description": "December 11, 1995 P. 41",
              "link": {
                "url": "http://archives.newyorker.com/?i=1995-12-11#folio=040",
              },
              "url": "https://static.cdn.realviewdigital.com/global/content/GetImage.aspx?pguid=FC9071DC-DD99-441F-A727-1B74670350BC&i=1995-12-11&folio=040",
            },
            "id": "B00000001",
            "parents": [
              "paragraph",
            ],
            "selfClosing": true,
            "type": "image",
          },
        ],
        "marks": [],
        "text": "￼￼",
      }
    `);
  });

  test("are kept separate when the link wraps text + image", () => {
    let doc = CommonmarkSource.fromRaw(
      `[text before the image ![December 11, 1995 P. 41](https://static.cdn.realviewdigital.com/global/content/GetImage.aspx?pguid=FC9071DC-DD99-441F-A727-1B74670350BC&i=1995-12-11&folio=040)](http://archives.newyorker.com/?i=1995-12-11#folio=040)`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {},
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "paragraph",
          },
          {
            "attributes": {
              "description": "December 11, 1995 P. 41",
              "url": "https://static.cdn.realviewdigital.com/global/content/GetImage.aspx?pguid=FC9071DC-DD99-441F-A727-1B74670350BC&i=1995-12-11&folio=040",
            },
            "id": "B00000001",
            "parents": [
              "paragraph",
            ],
            "selfClosing": true,
            "type": "image",
          },
        ],
        "marks": [
          {
            "attributes": {
              "url": "http://archives.newyorker.com/?i=1995-12-11#folio=040",
            },
            "id": "M00000000",
            "range": "(1..24)",
            "type": "link",
          },
        ],
        "text": "￼text before the image ￼",
      }
    `);
  });

  test("are kept separate when the link wraps text + image", () => {
    let doc = CommonmarkSource.fromRaw(
      `[![December 11, 1995 P. 41](https://static.cdn.realviewdigital.com/global/content/GetImage.aspx?pguid=FC9071DC-DD99-441F-A727-1B74670350BC&i=1995-12-11&folio=040) text after an image](http://archives.newyorker.com/?i=1995-12-11#folio=040)`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {},
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "paragraph",
          },
          {
            "attributes": {
              "description": "December 11, 1995 P. 41",
              "url": "https://static.cdn.realviewdigital.com/global/content/GetImage.aspx?pguid=FC9071DC-DD99-441F-A727-1B74670350BC&i=1995-12-11&folio=040",
            },
            "id": "B00000001",
            "parents": [
              "paragraph",
            ],
            "selfClosing": true,
            "type": "image",
          },
        ],
        "marks": [
          {
            "attributes": {
              "url": "http://archives.newyorker.com/?i=1995-12-11#folio=040",
            },
            "id": "M00000000",
            "range": "(1..22)",
            "type": "link",
          },
        ],
        "text": "￼￼ text after an image",
      }
    `);
  });

  test("are kept separate when the link wraps image + image", () => {
    let doc = CommonmarkSource.fromRaw(
      `[![December 11, 1995 P. 41](https://static.cdn.realviewdigital.com/global/content/GetImage.aspx?pguid=FC9071DC-DD99-441F-A727-1B74670350BC&i=1995-12-11&folio=040) ![December 11, 1995 P. 41](https://static.cdn.realviewdigital.com/global/content/GetImage.aspx?pguid=FC9071DC-DD99-441F-A727-1B74670350BC&i=1995-12-11&folio=041)](http://archives.newyorker.com/?i=1995-12-11#folio=040)`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {},
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "paragraph",
          },
          {
            "attributes": {
              "description": "December 11, 1995 P. 41",
              "url": "https://static.cdn.realviewdigital.com/global/content/GetImage.aspx?pguid=FC9071DC-DD99-441F-A727-1B74670350BC&i=1995-12-11&folio=040",
            },
            "id": "B00000001",
            "parents": [
              "paragraph",
            ],
            "selfClosing": true,
            "type": "image",
          },
          {
            "attributes": {
              "description": "December 11, 1995 P. 41",
              "url": "https://static.cdn.realviewdigital.com/global/content/GetImage.aspx?pguid=FC9071DC-DD99-441F-A727-1B74670350BC&i=1995-12-11&folio=041",
            },
            "id": "B00000002",
            "parents": [
              "paragraph",
            ],
            "selfClosing": true,
            "type": "image",
          },
        ],
        "marks": [
          {
            "attributes": {
              "url": "http://archives.newyorker.com/?i=1995-12-11#folio=040",
            },
            "id": "M00000000",
            "range": "(1..4)",
            "type": "link",
          },
        ],
        "text": "￼￼ ￼",
      }
    `);
  });
});

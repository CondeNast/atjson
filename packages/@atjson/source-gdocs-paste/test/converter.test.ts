import OffsetSource from "@atjson/offset-annotations";
import * as fs from "fs";
import * as path from "path";
import GDocsSource from "../src";

describe("@atjson/source-gdocs-paste", () => {
  let atjson: OffsetSource;

  beforeAll(() => {
    // https://docs.google.com/document/d/18pp4dAGx5II596HHGOLUXXcc6VKLAVRBUMLm9Ge8eOE/edit?usp=sharing
    let fixturePath = path.join(__dirname, "fixtures", "complex.json");
    let rawJSON = JSON.parse(fs.readFileSync(fixturePath).toString());
    let gdocs = GDocsSource.fromRaw(rawJSON);
    atjson = gdocs.convertTo(OffsetSource);
  });

  it("correctly converts -gdocs-ts_bd to bold", () => {
    let bolds = atjson.where((a) => a.type === "bold");
    expect(bolds.length).toEqual(2);
  });

  it("correctly converts italic", () => {
    let italics = atjson.where((a) => a.type === "italic");
    expect(italics.length).toEqual(2);
  });

  it("correctly converts headings, removing Titles and Subtitles", () => {
    let headings = atjson.where((a) => a.type === "heading");
    expect(headings.length).toEqual(2);
    expect(headings.map((h) => h.attributes.level)).toEqual([1, 2]);
  });

  it("correctly converts lists", () => {
    let lists = atjson.where((a) => a.type === "list");
    expect(lists.length).toEqual(2);
  });

  it("adds parse tokens around newlines separating list-items", () => {
    let lists = atjson.where((a) => a.type === "list").as("list");
    let allParseTokens = atjson
      .where((a) => a.type === "parse-token")
      .as("parseTokens");

    lists
      .outerJoin(allParseTokens, (l, r) => l.start <= r.start && l.end >= r.end)
      .forEach(({ list, parseTokens }) => {
        let newlines = atjson.match(/\n/g, list.start, list.end);
        expect(newlines.map((match) => [match.start, match.end])).toEqual(
          parseTokens.map((a) => [a.start, a.end])
        );
      });
  });

  it("correctly converts numbered lists", () => {
    let lists = atjson.where(
      (a) => a.type === "list" && a.attributes.type === "numbered"
    );
    expect(lists.length).toEqual(1);
  });

  it("correctly converts bulleted lists", () => {
    let lists = atjson.where(
      (a) => a.type === "list" && a.attributes.type === "bulleted"
    );
    expect(lists.length).toEqual(1);
  });

  it("correctly converts list-items", () => {
    let listItems = atjson.where((a) => a.type === "list-item");
    expect(listItems.length).toEqual(4);
  });

  it("correctly converts links", () => {
    let links = atjson.where((a) => a.type === "link");
    expect(links.length).toEqual(1);
    expect(links.map((link) => link.attributes.url)).toEqual([
      "https://www.google.com/",
    ]);
  });

  it("removes underlined text aligned exactly with links", () => {
    // https://docs.google.com/document/d/18pp4dAGx5II596HHGOLUXXcc6VKLAVRBUMLm9Ge8eOE/edit?usp=sharing
    let fixturePath = path.join(__dirname, "fixtures", "underline.json");
    let rawJSON = JSON.parse(fs.readFileSync(fixturePath).toString());
    let gdocs = GDocsSource.fromRaw(rawJSON);
    let doc = gdocs.convertTo(OffsetSource);

    let links = doc.where({ type: "-offset-link" }).as("links");
    let underlines = doc.where({ type: "-offset-underline" }).as("underline");

    expect(links.join(underlines, (a, b) => a.isAlignedWith(b)).length).toBe(0);
  });
});

describe("@atjson/source-gdocs-paste paragraphs", () => {
  let atjson: OffsetSource;

  const LINEBREAKS = [
    [21, 22],
    [249, 250],
    [284, 285],
    [285, 286],
    [370, 371],
    [446, 447],
    [447, 448],
  ].map(([start, end]) => {
    return {
      start,
      end,
      type: "-offset-line-break",
      attributes: {},
      id: expect.anything(),
    };
  });

  const PARAGRAPHS = [
    [0, 70],
    [71, 117],
    [119, 163],
    [166, 213],
    [487, 520],
  ].map(([start, end]) => {
    return {
      start,
      end,
      type: "-offset-paragraph",
      attributes: {},
      id: expect.anything(),
    };
  });

  const LISTS = [
    [214, 486],
    [521, 538],
  ].map(([start, end]) => {
    return {
      start,
      end,
      type: "-offset-list",
      attributes: { "-offset-type": "numbered" },
      id: expect.anything(),
    };
  });

  const LIST_ITEMS = [
    [214, 324],
    [325, 405],
    [406, 486],
    [521, 537],
  ].map(([start, end]) => {
    return {
      start,
      end,
      type: "-offset-list-item",
      attributes: {},
      id: expect.anything(),
    };
  });

  beforeAll(() => {
    // https://docs.google.com/document/d/1PzhE6OJqRIHrDZcXBjw7UsjUhH_ITPP7tgg2s9fhPf4/edit
    let fixturePath = path.join(__dirname, "fixtures", "paragraphs.json");
    let rawJSON = JSON.parse(fs.readFileSync(fixturePath).toString());
    let gdocs = GDocsSource.fromRaw(rawJSON);
    atjson = gdocs.convertTo(OffsetSource);
  });

  it("converts vertical tabs to line breaks", () => {
    // eslint-disable-next-line no-control-regex
    let verticalTabs = atjson.match(/\u000b/g);

    expect(
      verticalTabs.map(({ start, end }) => ({ start, end }))
    ).toMatchObject(LINEBREAKS.map(({ start, end }) => ({ start, end })));
    expect(atjson.where({ type: "-offset-line-break" }).toJSON()).toMatchObject(
      LINEBREAKS
    );
  });

  it("created paragraphs", () => {
    let paragraphs = atjson.where({ type: "-offset-paragraph" });

    expect(paragraphs.toJSON()).toMatchObject(PARAGRAPHS);
  });

  it("created four paragraphs before the list", () => {
    let listsAndParagraphs = atjson
      .where({ type: "-offset-list" })
      .as("list")
      .join(
        atjson.where({ type: "-offset-paragraph" }).as("paragraphs"),
        (l, r) => r.end <= l.start
      );

    expect(listsAndParagraphs.toJSON()[0]).toMatchObject({
      list: LISTS[0],
      paragraphs: PARAGRAPHS.slice(0, 4),
    });
  });

  it("created first paragraph with one nested linebreak", () => {
    let firstParagraph = atjson
      .where({ type: "-offset-paragraph" })
      .as("paragraph")
      .join(
        atjson.where({ type: "-offset-line-break" }).as("linebreaks"),
        (l, r) => r.start > l.start && r.end < l.end
      )
      .toJSON()[0];

    expect(firstParagraph).toEqual({
      paragraph: PARAGRAPHS[0],
      linebreaks: LINEBREAKS.slice(0, 1),
    });
  });

  it("created linebreaks inside list-items", () => {
    let linebreaksInLists = atjson
      .where({ type: "-offset-line-break" })
      .as("linebreak")
      .join(
        atjson.where({ type: "-offset-list" }).as("lists"),
        (l, r) => l.start >= r.start && l.end <= r.end
      )
      .outerJoin(
        atjson.where({ type: "-offset-list-item" }).as("list-items"),
        (l, r) => l.linebreak.start >= r.start && l.linebreak.end <= r.end
      );

    // No linebreaks in a list outside of a list-item
    expect(
      linebreaksInLists
        .where(
          (join) => join.lists.length > 0 && join["list-items"].length === 0
        )
        .toJSON()
    ).toHaveLength(0);

    expect(linebreaksInLists.toJSON()).toMatchObject([
      {
        linebreak: LINEBREAKS[1],
        lists: [LISTS[0]],
        "list-items": [LIST_ITEMS[0]],
      },
      {
        linebreak: LINEBREAKS[2],
        lists: [LISTS[0]],
        "list-items": [LIST_ITEMS[0]],
      },
      {
        linebreak: LINEBREAKS[3],
        lists: [LISTS[0]],
        "list-items": [LIST_ITEMS[0]],
      },
      {
        linebreak: LINEBREAKS[4],
        lists: [LISTS[0]],
        "list-items": [LIST_ITEMS[1]],
      },
      {
        linebreak: LINEBREAKS[5],
        lists: [LISTS[0]],
        "list-items": [LIST_ITEMS[2]],
      },
      {
        linebreak: LINEBREAKS[6],
        lists: [LISTS[0]],
        "list-items": [LIST_ITEMS[2]],
      },
    ]);
  });

  it("created no paragraphs inside list-items", () => {
    let paragraphs = atjson
      .where({ type: "-offset-paragraph" })
      .as("paragraph");

    let paragraphsInLists = paragraphs.join(
      atjson.where({ type: "-offset-list" }).as("lists"),
      (l, r) => l.start >= r.start && l.end <= r.end
    );

    expect(paragraphsInLists.length).toBe(0);
  });

  it("inserts object replaement character for single-item lists", () => {
    let ocrs = atjson.match(/\uFFFC/g, LISTS[1].start, LISTS[1].end);
    expect(ocrs).toEqual([
      {
        start: LISTS[1].end - 1,
        end: LISTS[1].end,
        matches: expect.anything(),
      },
    ]);

    let lists = atjson.where({ type: "-offset-list" });
    expect(lists.toJSON()).toMatchObject(LISTS);

    let listItems = atjson.where({ type: "-offset-list-item" });
    expect(listItems.toJSON()).toMatchObject(LIST_ITEMS);
  });
});

describe("@atjson/source-gdocs-paste", () => {
  let atjson: OffsetSource;

  // https://docs.google.com/document/d/e/2PACX-1vSty31WXqvhSHwPxJD1QpWdeW7RbZhqJUFW8DVLbxVj9BacHVQdlKoBt0NWCAKBgqXHFgbZJdBfoyUP/pub
  const fixturePath = path.join(__dirname, "fixtures", "line-breaks.json");

  beforeAll(() => {
    let rawJSON = JSON.parse(fs.readFileSync(fixturePath).toString());
    let gdocs = GDocsSource.fromRaw(rawJSON);
    atjson = gdocs.convertTo(OffsetSource);
  });

  it("has correct paragraphs", () => {
    expect(atjson.content).toBe("Test\na\nTest\n \nTest\n");

    let paragraphs = atjson.where({
      type: "-offset-paragraph",
    });
    expect(paragraphs.toJSON()).toMatchObject(
      [
        [0, 4],
        [5, 6],
        [7, 11],
        [14, 18],
      ].map(([start, end]) => ({
        start,
        end,
        type: "-offset-paragraph",
      }))
    );
  });

  it("has no line breaks", () => {
    let linebreaks = atjson.where({
      type: "-offset-line-break",
    });
    expect(linebreaks.length).toBe(0);
  });

  it("has correct parse tokens", () => {
    expect(atjson.content).toBe("Test\na\nTest\n \nTest\n");

    let parseTokens = atjson.where({
      type: "-atjson-parse-token",
    });
    expect(parseTokens.toJSON()).toMatchObject(
      [
        [4, 5],
        [6, 7],
        [11, 14],
        [18, 19],
      ].map(([start, end]) => ({
        start,
        end,
        type: "-atjson-parse-token",
        attributes: {
          "-atjson-reason": "paragraph boundary",
        },
      }))
    );
  });
});

describe("@atjson/source-gdocs-paste paragraphs in list", () => {
  let doc: OffsetSource;

  beforeAll(() => {
    // https://docs.google.com/document/d/e/2PACX-1vRX6dmzmlW4NtjFj-KlXp3TGQTVyMBVBCVBwO4q9Bwwv8clmULhLmKjGxbz6Lf_qnLEQX9gewoAVJaz/pub
    let fixturePath = path.join(
      __dirname,
      "fixtures",
      "list-with-interrupting-paragraph.json"
    );
    let rawJSON = JSON.parse(fs.readFileSync(fixturePath).toString());
    let gdocs = GDocsSource.fromRaw(rawJSON);
    doc = gdocs.convertTo(OffsetSource);
  });

  it("splits lists interrupted by a paragraph not in a list item", () => {
    expect(doc.content).toBe("A\nB\nC\nD\uFFFC");
    expect(doc.where({ type: "-offset-paragraph" }).toJSON()).toMatchObject([
      { start: 4, end: 5 },
    ]);
    expect(doc.where({ type: "-offset-list" }).toJSON()).toMatchObject([
      { start: 0, end: 4, attributes: { "-offset-type": "numbered" } },
      { start: 6, end: 8, attributes: { "-offset-type": "numbered" } },
    ]);
    expect(doc.where({ type: "-offset-list-item" }).toJSON()).toMatchObject([
      { start: 0, end: 1 },
      { start: 2, end: 3 },
      { start: 6, end: 7 },
    ]);
    expect(doc.where({ type: "-atjson-parse-token" }).toJSON()).toMatchObject([
      {
        start: 1,
        end: 2,
        attributes: { "-atjson-reason": "list item separator" },
      },
      {
        start: 3,
        end: 4,
        attributes: { "-atjson-reason": "list item separator" },
      },
      {
        start: 5,
        end: 6,
        attributes: { "-atjson-reason": "paragraph boundary" },
      },
      {
        start: 7,
        end: 8,
        attributes: {
          "-atjson-reason": "object replacement character for single-item list",
        },
      },
    ]);
  });
});

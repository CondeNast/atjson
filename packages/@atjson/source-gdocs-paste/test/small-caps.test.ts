import OffsetSource, { SmallCaps } from "@atjson/offset-annotations";
import * as fs from "fs";
import * as path from "path";
import GDocsSource from "../src";
import { serialize, is } from "@atjson/document";

describe("@atjson/source-gdocs-paste", () => {
  describe("small caps", () => {
    let doc: OffsetSource;
    beforeAll(() => {
      // https://docs.google.com/document/d/1gJpY_MX6LVpn3L5PwILaCpVl2NLz05fbCCS240dsI1o/edit?usp=sharing
      let fixturePath = path.join(__dirname, "fixtures", "small-caps.json");
      let rawJSON = JSON.parse(fs.readFileSync(fixturePath).toString());
      let gdocs = GDocsSource.fromRaw(rawJSON);
      doc = gdocs.convertTo(OffsetSource);
    });

    test("dataset", () => {
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
          ],
          "marks": [
            {
              "attributes": {},
              "id": "M00000000",
              "range": "(9..15]",
              "type": "small-caps",
            },
            {
              "attributes": {},
              "id": "M00000001",
              "range": "(67..71]",
              "type": "small-caps",
            },
            {
              "attributes": {},
              "id": "M00000002",
              "range": "(79..88]",
              "type": "small-caps",
            },
            {
              "attributes": {},
              "id": "M00000003",
              "range": "(494..502]",
              "type": "small-caps",
            },
          ],
          "text": "￼Just by chance, Dylan’s “Christmas in the Heart” happened to fall aids in mid-Ddecember, which enriched the experience of that spirited if bewildering holiday album. (For me, it will never again feel like Christmas without hearing Dylan croak “Adeste Fideles” in his surreal Latin.) Every discography adds another chronological-cultural layer atop the ordinary passage of time: the year 2020 yielded nobody’s idea of an ideal summer, but for me it was at least enlivened by earlier Beach Boys releases, from the 1964 hit “All summer Long” and the 1966 critical-consensus masterpiece “Pet Sounds” to the 1973 ambitious conclusion to the band’s long heyday, “Holland.”",
        }
      `);
    });
  });

  describe("small caps from font size", () => {
    let doc: OffsetSource;
    beforeAll(() => {
      let fixturePath = path.join(
        __dirname,
        "fixtures",
        "small-caps-shorthand.json"
      );
      let rawJSON = JSON.parse(fs.readFileSync(fixturePath).toString());
      let gdocs = GDocsSource.fromRaw(rawJSON);
      doc = gdocs.convertTo(OffsetSource);
    });

    test("Uppercase text in a smaller font creates small caps", () => {
      let smallcapsAnnotations = doc.annotations.filter((annotation) =>
        is(annotation, SmallCaps)
      );

      expect(smallcapsAnnotations.length).toBe(1);
      expect(
        doc.content.slice(
          smallcapsAnnotations[0].start,
          smallcapsAnnotations[0].end
        )
      ).toBe("WHICH INDICATES");
    });
  });
});

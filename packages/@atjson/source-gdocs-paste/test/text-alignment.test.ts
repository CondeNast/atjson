import OffsetSource from "@atjson/offset-annotations";
import * as fs from "fs";
import * as path from "path";
import GDocsSource from "../src";

describe("@atjson/source-gdocs-paste", () => {
  describe("text alignment", () => {
    describe("headings", () => {
      let doc: OffsetSource;
      beforeAll(() => {
        // https://docs.google.com/document/d/1-5dIvVfeaZKiNMXpjH3Oyg-5OsWqTQxCuZbLPCL5Y3w/edit?usp=sharing
        let fixturePath = path.join(
          __dirname,
          "fixtures",
          "heading-alignment.json"
        );
        let rawJSON = JSON.parse(fs.readFileSync(fixturePath).toString());
        let gdocs = GDocsSource.fromRaw(rawJSON);
        doc = gdocs.convertTo(OffsetSource);
      });

      test("start", () => {
        expect(doc.content).toBe("Left\nCentered\nRight\nJustified\n");
        expect(
          doc
            .where({
              type: "-offset-heading",
              attributes: { "-offset-level": 1 },
            })
            .toJSON()
        ).toMatchObject([
          {
            type: "-offset-heading",
            start: 0,
            end: 4,
            attributes: { "-offset-level": 1 },
          },
        ]);
      });

      test("center", () => {
        expect(
          doc
            .where({
              type: "-offset-heading",
              attributes: { "-offset-level": 2 },
            })
            .toJSON()
        ).toMatchObject([
          {
            type: "-offset-heading",
            start: 5,
            end: 13,
            attributes: { "-offset-level": 2, "-offset-alignment": "center" },
          },
        ]);
      });

      test("end", () => {
        expect(
          doc
            .where({
              type: "-offset-heading",
              attributes: { "-offset-level": 3 },
            })
            .toJSON()
        ).toMatchObject([
          {
            type: "-offset-heading",
            start: 14,
            end: 19,
            attributes: { "-offset-level": 3, "-offset-alignment": "end" },
          },
        ]);
      });

      test("justified", () => {
        expect(
          doc
            .where({
              type: "-offset-heading",
              attributes: { "-offset-level": 4 },
            })
            .toJSON()
        ).toMatchObject([
          {
            type: "-offset-heading",
            start: 20,
            end: 29,
            attributes: { "-offset-level": 4, "-offset-alignment": "justify" },
          },
        ]);
      });
    });
  });

  describe("paragraph", () => {
    let doc: OffsetSource;
    beforeAll(() => {
      // https://docs.google.com/document/d/1KDcwN4gR-Es4LNIm2YwYJdvAlGrvWNMyd1mgXWGbEp0/edit?usp=sharing
      let fixturePath = path.join(
        __dirname,
        "fixtures",
        "paragraph-alignment.json"
      );
      let rawJSON = JSON.parse(fs.readFileSync(fixturePath).toString());
      let gdocs = GDocsSource.fromRaw(rawJSON);
      doc = gdocs.convertTo(OffsetSource);
    });

    test("start", () => {
      expect(doc.content).toBe("Left\nCentered\nRight\nJustified\n");
      let [left] = doc.where({ type: "-offset-paragraph" }).sort();
      expect(left.toJSON()).toMatchObject({
        type: "-offset-paragraph",
        start: 0,
        end: 4,
        attributes: {},
      });
    });

    test("center", () => {
      let [, center] = doc.where({ type: "-offset-paragraph" }).sort();

      expect(center.toJSON()).toMatchObject({
        type: "-offset-paragraph",
        start: 5,
        end: 13,
        attributes: { "-offset-alignment": "center" },
      });
    });

    test("end", () => {
      let [, , right] = doc.where({ type: "-offset-paragraph" }).sort();
      expect(right.toJSON()).toMatchObject({
        type: "-offset-paragraph",
        start: 14,
        end: 19,
        attributes: { "-offset-alignment": "end" },
      });
    });

    test("justified", () => {
      let [, , , justified] = doc.where({ type: "-offset-paragraph" }).sort();
      expect(justified.toJSON()).toMatchObject({
        type: "-offset-paragraph",
        start: 20,
        end: 29,
        attributes: { "-offset-alignment": "justify" },
      });
    });
  });

  describe("rtl", () => {
    let doc: OffsetSource;
    beforeAll(() => {
      // https://docs.google.com/document/d/1JW5m2FcdOvwTwxwVYXKpc9ljzPnyYwaLyLPeeCMUsJQ/edit?usp=sharing
      let fixturePath = path.join(
        __dirname,
        "fixtures",
        "rtl-paragraph-alignment.json"
      );
      let rawJSON = JSON.parse(fs.readFileSync(fixturePath).toString());
      let gdocs = GDocsSource.fromRaw(rawJSON);
      doc = gdocs.convertTo(OffsetSource);
    });

    test("start", () => {
      expect(doc.content).toBe("بداية\nمركز\nالنهاية\nنص\n\n");
      let [left] = doc.where({ type: "-offset-paragraph" }).sort();
      expect(left.toJSON()).toMatchObject({
        type: "-offset-paragraph",
        start: 0,
        end: 5,
        attributes: {},
      });
    });

    test("center", () => {
      let [, center] = doc.where({ type: "-offset-paragraph" }).sort();

      expect(center.toJSON()).toMatchObject({
        type: "-offset-paragraph",
        start: 6,
        end: 10,
        attributes: { "-offset-alignment": "center" },
      });
    });

    test("end", () => {
      let [, , right] = doc.where({ type: "-offset-paragraph" }).sort();
      expect(right.toJSON()).toMatchObject({
        type: "-offset-paragraph",
        start: 11,
        end: 18,
        attributes: { "-offset-alignment": "end" },
      });
    });

    test("justified", () => {
      let [, , , justified] = doc.where({ type: "-offset-paragraph" }).sort();
      expect(justified.toJSON()).toMatchObject({
        type: "-offset-paragraph",
        start: 19,
        end: 21,
        attributes: { "-offset-alignment": "justify" },
      });
    });
  });
});

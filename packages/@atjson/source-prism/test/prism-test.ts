import { HIR } from "@atjson/hir";
import OffsetSource from "@atjson/offset-annotations";
import * as fs from "fs";
import * as path from "path";
import PRISMSource from "../src";

describe("@atjson/source-prism", () => {
  it("parses xml declaration", () => {
    let doc = PRISMSource.fromRaw('<?xml version="1.0" encoding="utf-8"?>');

    expect(doc.where({}).toJSON()).toMatchObject([
      {
        type: "-atjson-parse-token",
        start: 0,
        end: doc.content.length,
        attributes: {
          "-atjson-reason": "<?xml>",
        },
      },
    ]);
  });

  it("does not require xml declaration", () => {
    let doc = PRISMSource.fromRaw("<body>some text</body>");

    expect(doc.where({}).sort().toJSON()).toMatchObject([
      { type: "-html-body", start: 0, end: 22 },
      {
        type: "-atjson-parse-token",
        start: 0,
        end: 6,
        attributes: { "-atjson-reason": "<body>" },
      },
      {
        type: "-atjson-parse-token",
        start: 15,
        end: 22,
        attributes: { "-atjson-reason": "</body>" },
      },
    ]);
  });

  it("parses xml tags", () => {
    let doc = PRISMSource.fromRaw(
      `<?xml version="1.0" encoding="utf-8"?><pam:message><pam:article><head /><body>text</body></pam:article></pam:message>`
    );
    let hir = new HIR(doc);

    expect(hir.toJSON()).toMatchObject({
      children: [
        {
          type: "message",
          children: [
            {
              type: "article",
              children: [
                { type: "head" },
                { type: "body", children: ["text"] },
              ],
            },
          ],
        },
      ],
    });

    expect(doc.where({}).sort().toJSON()).toMatchObject([
      {
        type: "-atjson-parse-token",
        start: 0,
        end: 38,
        attributes: { "-atjson-reason": "<?xml>" },
      },
      { type: "-pam-message", start: 38, end: 117 },
      {
        type: "-atjson-parse-token",
        start: 38,
        end: 51,
        attributes: { "-atjson-reason": "<pam:message>" },
      },
      { type: "-pam-article", start: 51, end: 103 },
      {
        type: "-atjson-parse-token",
        start: 51,
        end: 64,
        attributes: { "-atjson-reason": "<pam:article>" },
      },
      { type: "-html-head", start: 64, end: 72 },
      {
        type: "-atjson-parse-token",
        start: 64,
        end: 72,
        attributes: { "-atjson-reason": "<head/>" },
      },
      { type: "-html-body", start: 72, end: 89 },
      {
        type: "-atjson-parse-token",
        start: 72,
        end: 78,
        attributes: { "-atjson-reason": "<body>" },
      },
      {
        type: "-atjson-parse-token",
        start: 82,
        end: 89,
        attributes: { "-atjson-reason": "</body>" },
      },
      {
        type: "-atjson-parse-token",
        start: 89,
        end: 103,
        attributes: { "-atjson-reason": "</pam:article>" },
      },
      {
        type: "-atjson-parse-token",
        start: 103,
        end: 117,
        attributes: { "-atjson-reason": "</pam:message>" },
      },
    ]);
  });

  describe("xml entities", () => {
    test.each([
      ["&#8704;", "∀"], // dec entity
      ["&#x201C;", "“"], // hex entity
      ["&quot;", '"'], // five named xml entities
      ["&amp;", "&"],
      ["&apos;", "'"],
      ["&lt;", "<"],
      ["&gt;", ">"],
      ["&rsquo;", "&rsquo;"], // other named entities are not supported
    ])("converts %s to %s", (entity, expected) => {
      let doc = PRISMSource.fromRaw(
        `<?xml version="1.0" encoding="utf-8"?><body>${entity}</body>`
      );

      expect(doc.content).toEqual(
        `<?xml version="1.0" encoding="utf-8"?><body>${expected}</body>`
      );
    });

    it("repositions annotations after replacing entities", () => {
      let doc = PRISMSource.fromRaw(
        "<pam:article><head><dc:title>Title</dc:title></head><body><p>&#8704;x&#8712;Λ, x&#8744;&#172;x&#x220E;</p></body></pam:article>"
      );

      expect(doc.content).toEqual(
        "<pam:article><head><dc:title>Title</dc:title></head><body><p>∀x∈Λ, x∨¬x∎</p></body></pam:article>"
      );
      expect(doc.where({}).sort().toJSON()).toMatchObject([
        { type: "-pam-article", start: 0, end: 97 },
        {
          type: "-atjson-parse-token",
          start: 0,
          end: 13,
          attributes: { "-atjson-reason": "<pam:article>" },
        },
        { type: "-html-head", start: 13, end: 52 },
        {
          type: "-atjson-parse-token",
          start: 13,
          end: 19,
          attributes: { "-atjson-reason": "<head>" },
        },
        { type: "-dc-title", start: 19, end: 45 },
        {
          type: "-atjson-parse-token",
          start: 19,
          end: 29,
          attributes: { "-atjson-reason": "<dc:title>" },
        },
        {
          type: "-atjson-parse-token",
          start: 34,
          end: 45,
          attributes: { "-atjson-reason": "</dc:title>" },
        },
        {
          type: "-atjson-parse-token",
          start: 45,
          end: 52,
          attributes: { "-atjson-reason": "</head>" },
        },
        { type: "-html-body", start: 52, end: 83 },
        {
          type: "-atjson-parse-token",
          start: 52,
          end: 58,
          attributes: { "-atjson-reason": "<body>" },
        },
        { type: "-html-p", start: 58, end: 76 },
        {
          type: "-atjson-parse-token",
          start: 58,
          end: 61,
          attributes: { "-atjson-reason": "<p>" },
        },
        {
          type: "-atjson-parse-token",
          start: 72,
          end: 76,
          attributes: { "-atjson-reason": "</p>" },
        },
        {
          type: "-atjson-parse-token",
          start: 76,
          end: 83,
          attributes: { "-atjson-reason": "</body>" },
        },
        {
          type: "-atjson-parse-token",
          start: 83,
          end: 97,
          attributes: { "-atjson-reason": "</pam:article>" },
        },
      ]);
    });
  });

  describe("prism snapshots", () => {
    test.each([["gq-fresh-paint.xml"], ["gq-santoni.xml"], ["gq-yuketen.xml"]])(
      "parses %s",
      (xmlFile) => {
        let fixturePath = path.join(__dirname, "fixtures", xmlFile);
        let xml = fs.readFileSync(fixturePath).toString();

        let doc = PRISMSource.fromRaw(xml).withStableIds();
        let hir = new HIR(doc);
        hir.rootNode.id = "00000000";

        expect(hir.toJSON()).toMatchSnapshot();
        expect(
          doc.convertTo(OffsetSource).withStableIds().toJSON()
        ).toMatchSnapshot();
      }
    );
  });
});

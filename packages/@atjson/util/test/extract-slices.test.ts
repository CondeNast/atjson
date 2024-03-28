import { extractSlices } from "../src";

describe("extractSlices", () => {
  test("no slices", () => {
    let original = {
      text: "\uFFFCHello, world",
      blocks: [
        {
          id: "B0",
          type: "text",
          parents: [],
          selfClosing: false,
          attributes: {},
        },
      ],
      marks: [],
    };
    let [doc, slices] = extractSlices(original);
    expect(doc).toMatchObject(original);
    expect(slices).toMatchInlineSnapshot(`Map {}`);
  });

  test("retained slices", () => {
    let original = {
      text: "\uFFFCHello, world",
      blocks: [
        {
          id: "B0",
          type: "text",
          parents: [],
          selfClosing: false,
          attributes: {},
        },
      ],
      marks: [
        {
          id: "M0",
          type: "slice",
          range: "[0..13]",
          attributes: {
            retain: true,
          },
        },
      ],
    };
    let [doc, slices] = extractSlices(original);
    expect(doc).toMatchObject({
      text: "\uFFFCHello, world",
      blocks: [
        {
          id: "B0",
          type: "text",
          parents: [],
          selfClosing: false,
          attributes: {},
        },
      ],
      marks: [],
    });
    expect(slices).toMatchInlineSnapshot(`
      Map {
        "M0" => {
          "blocks": [
            {
              "attributes": {},
              "id": "M0-B0",
              "parents": [],
              "selfClosing": false,
              "type": "text",
            },
          ],
          "marks": [],
          "text": "￼Hello, world",
        },
      }
    `);
  });

  test("single slice", () => {
    let original = {
      text: "\uFFFCHello, world",
      blocks: [
        {
          id: "B0",
          type: "text",
          parents: [],
          selfClosing: false,
          attributes: {},
        },
      ],
      marks: [
        {
          id: "M0",
          type: "slice",
          range: "[0..13]",
          attributes: {},
        },
      ],
    };
    let [doc, slices] = extractSlices(original);
    expect(doc).toMatchObject({
      text: "",
      blocks: [],
      marks: [],
    });
    expect(slices).toMatchInlineSnapshot(`
      Map {
        "M0" => {
          "blocks": [
            {
              "attributes": {},
              "id": "M0-B0",
              "parents": [],
              "selfClosing": false,
              "type": "text",
            },
          ],
          "marks": [],
          "text": "￼Hello, world",
        },
      }
    `);
  });

  test("slice without a block", () => {
    let original = {
      text: "\uFFFCHello, world",
      blocks: [
        {
          id: "B0",
          type: "text",
          parents: [],
          selfClosing: false,
          attributes: {},
        },
      ],
      marks: [
        {
          id: "M0",
          type: "slice",
          range: "[1..13]",
          attributes: {},
        },
      ],
    };
    let [doc, slices] = extractSlices(original);
    expect(doc).toMatchObject({
      text: "\uFFFC",
      blocks: [
        {
          id: "B0",
          type: "text",
          parents: [],
          selfClosing: false,
          attributes: {},
        },
      ],
      marks: [],
    });
    expect(slices).toMatchInlineSnapshot(`
      Map {
        "M0" => {
          "blocks": [
            {
              "attributes": {},
              "id": "text-M0",
              "parents": [],
              "selfClosing": false,
              "type": "text",
            },
          ],
          "marks": [],
          "text": "￼Hello, world",
        },
      }
    `);
  });

  test("mark in slice", () => {
    let original = {
      text: "\uFFFCHello, world",
      blocks: [
        {
          id: "B0",
          type: "text",
          parents: [],
          selfClosing: false,
          attributes: {},
        },
      ],
      marks: [
        {
          id: "M0",
          type: "slice",
          range: "[0..13]",
          attributes: {},
        },
        {
          id: "M1",
          type: "bold",
          range: "[1..13]",
          attributes: {},
        },
      ],
    };
    let [doc, slices] = extractSlices(original);
    expect(doc).toMatchObject({
      text: "",
      blocks: [],
      marks: [],
    });
    expect(slices).toMatchInlineSnapshot(`
      Map {
        "M0" => {
          "blocks": [
            {
              "attributes": {},
              "id": "M0-B0",
              "parents": [],
              "selfClosing": false,
              "type": "text",
            },
          ],
          "marks": [
            {
              "attributes": {},
              "end": 13,
              "id": "M0-M1",
              "range": "[1..13]",
              "start": 1,
              "type": "bold",
            },
          ],
          "text": "￼Hello, world",
        },
      }
    `);
  });

  test("mark crossing slice boundary", () => {
    let original = {
      text: "\uFFFCHello, world\uFFFCThis is a paragraph",
      blocks: [
        {
          id: "B0",
          type: "text",
          parents: [],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "B1",
          type: "paragraph",
          parents: [],
          selfClosing: false,
          attributes: {},
        },
      ],
      marks: [
        {
          id: "M0",
          type: "slice",
          range: "[0..13]",
          attributes: {},
        },
        {
          id: "M1",
          type: "bold",
          range: "[1..33]",
          attributes: {},
        },
      ],
    };
    let [doc, slices] = extractSlices(original);
    expect(doc).toMatchObject({
      text: "\uFFFCThis is a paragraph",
      blocks: [
        {
          id: "B1",
          type: "paragraph",
          parents: [],
          selfClosing: false,
          attributes: {},
        },
      ],
      marks: [
        {
          id: "M1",
          type: "bold",
          range: "[0..20]",
          attributes: {},
        },
      ],
    });
    expect(slices).toMatchInlineSnapshot(`
      Map {
        "M0" => {
          "blocks": [
            {
              "attributes": {},
              "id": "M0-B0",
              "parents": [],
              "selfClosing": false,
              "type": "text",
            },
          ],
          "marks": [],
          "text": "￼Hello, world",
        },
      }
    `);
  });

  test("multiple blocks in slice", () => {
    const original = {
      text: "￼￼Maude by Anna Margaret Hollyman from anna margaret hollyman on Vimeo.￼Teeny thought it was just another routine babysitting job—until she's shocked to meet the client. As the day goes on, Teeny decides to become the woman she had no idea she always wanted to be ... until she gets caught.\"Maude\" is this week's Staff Pick Premiere! Read more about it here: https://vimeo.com/blog/post/staff-pick-premiere-maude-by-anna-margaret-hollyman/",
      blocks: [
        {
          id: "B00000000",
          type: "video-embed",
          parents: [],
          selfClosing: false,
          attributes: {
            provider: "VIMEO",
            url: "https://player.vimeo.com/video/366624013",
            width: 640,
            height: 360,
            caption: "M00000000",
          },
        },
        {
          id: "B00000001",
          type: "paragraph",
          parents: ["video-embed"],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "B00000002",
          type: "paragraph",
          parents: ["video-embed"],
          selfClosing: false,
          attributes: {},
        },
      ],
      marks: [
        {
          id: "M00000000",
          type: "slice",
          range: "(1..439]",
          attributes: {
            refs: ["B00000000"],
          },
        },
        {
          id: "M00000001",
          type: "link",
          range: "(2..33)",
          attributes: {
            url: "https://vimeo.com/366624013",
          },
        },
        {
          id: "M00000002",
          type: "link",
          range: "(39..61)",
          attributes: {
            url: "https://vimeo.com/annamargarethollyman",
          },
        },
        {
          id: "M00000003",
          type: "link",
          range: "(65..70)",
          attributes: {
            url: "https://vimeo.com",
          },
        },
      ],
    };
    let [, slices] = extractSlices(original);
    expect(slices.get("M00000000")?.blocks.length).toBe(2);
    expect(slices.get("M00000000")?.blocks[0].parents).toStrictEqual([]);
    expect(slices.get("M00000000")?.blocks[1].parents).toStrictEqual([]);
  });

  describe("overlapping slices", () => {
    test("multiple in sequence", () => {
      const original = {
        text: "￼ABACAD",
        blocks: [
          {
            id: "B00000000",
            type: "paragraph",
            parents: [],
            selfClosing: false,
            attributes: {},
          },
        ],
        marks: [
          {
            id: "M00000000",
            type: "slice",
            range: "(1..6]",
            attributes: {
              refs: ["M00000000"],
            },
          },
          {
            id: "M00000001",
            type: "slice",
            range: "(2..3]",
            attributes: {
              refs: ["B00000000"],
            },
          },
          {
            id: "M00000002",
            type: "slice",
            range: "(4..5]",
            attributes: {
              refs: ["B00000000"],
            },
          },
        ],
      };
      let [doc, slices] = extractSlices(original);
      expect(slices.get("M00000000")?.text).toEqual("￼AAA");
      expect(slices.get("M00000001")?.text).toEqual("￼B");
      expect(slices.get("M00000002")?.text).toEqual("￼C");
      expect(doc.text).toEqual("￼D");
    });

    test("start slice position matches", () => {
      const original = {
        text: "￼BAD",
        blocks: [
          {
            id: "B00000000",
            type: "paragraph",
            parents: [],
            selfClosing: false,
            attributes: {},
          },
        ],
        marks: [
          {
            id: "M00000000",
            type: "slice",
            range: "(1..3]",
            attributes: {
              refs: ["M00000000"],
            },
          },
          {
            id: "M00000001",
            type: "slice",
            range: "(1..2]",
            attributes: {
              refs: ["B00000000"],
            },
          },
        ],
      };
      let [doc, slices] = extractSlices(original);
      expect(slices.get("M00000000")?.text).toEqual("￼A");
      expect(slices.get("M00000001")?.text).toEqual("￼B");
      expect(doc.text).toEqual("￼D");
    });

    test("end slice position matches", () => {
      const original = {
        text: "￼ABD",
        blocks: [
          {
            id: "B00000000",
            type: "paragraph",
            parents: [],
            selfClosing: false,
            attributes: {},
          },
        ],
        marks: [
          {
            id: "M00000000",
            type: "slice",
            range: "(1..3]",
            attributes: {
              refs: ["M00000000"],
            },
          },
          {
            id: "M00000001",
            type: "slice",
            range: "(2..3]",
            attributes: {
              refs: ["B00000000"],
            },
          },
        ],
      };
      let [doc, slices] = extractSlices(original);
      expect(slices.get("M00000000")?.text).toEqual("￼A");
      expect(slices.get("M00000001")?.text).toEqual("￼B");
      expect(doc.text).toEqual("￼D");
    });

    test("multiple overlapping", () => {
      const original = {
        text: "￼ABCBD",
        blocks: [
          {
            id: "B00000000",
            type: "paragraph",
            parents: [],
            selfClosing: false,
            attributes: {},
          },
        ],
        marks: [
          {
            id: "M00000000",
            type: "slice",
            range: "(1..5]",
            attributes: {
              refs: ["M00000000"],
            },
          },
          {
            id: "M00000001",
            type: "slice",
            range: "(2..5]",
            attributes: {
              refs: ["B00000000"],
            },
          },
          {
            id: "M00000002",
            type: "slice",
            range: "(3..4]",
            attributes: {
              refs: ["B00000000"],
            },
          },
        ],
      };
      let [doc, slices] = extractSlices(original);
      expect(slices.get("M00000000")?.text).toEqual("￼A");
      expect(slices.get("M00000001")?.text).toEqual("￼BB");
      expect(slices.get("M00000002")?.text).toEqual("￼C");
      expect(doc.text).toEqual("￼D");
    });

    test("hanging overlapping slices", () => {
      const original = {
        text: "￼ABCD",
        blocks: [
          {
            id: "B00000000",
            type: "paragraph",
            parents: [],
            selfClosing: false,
            attributes: {},
          },
        ],
        marks: [
          {
            id: "M00000000",
            type: "slice",
            range: "(1..3]",
            attributes: {
              refs: ["M00000000"],
            },
          },
          {
            id: "M00000001",
            type: "slice",
            range: "(2..4]",
            attributes: {
              refs: ["B00000000"],
            },
          },
        ],
      };
      let [doc, slices] = extractSlices(original);
      expect(slices.get("M00000000")?.text).toEqual("￼AB");
      expect(slices.get("M00000001")?.text).toEqual("￼BC");
      expect(doc.text).toEqual("￼D");
    });

    describe("retain", () => {
      test("multiple in sequence", () => {
        const original = {
          text: "￼ABACAD",
          blocks: [
            {
              id: "B00000000",
              type: "paragraph",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],
          marks: [
            {
              id: "M00000000",
              type: "slice",
              range: "(1..6]",
              attributes: {
                refs: ["M00000000"],
              },
            },
            {
              id: "M00000001",
              type: "slice",
              range: "(2..3]",
              attributes: {
                retain: true,
                refs: ["B00000000"],
              },
            },
            {
              id: "M00000002",
              type: "slice",
              range: "(4..5]",
              attributes: {
                refs: ["B00000000"],
              },
            },
          ],
        };
        let [doc, slices] = extractSlices(original);
        expect(slices.get("M00000000")?.text).toEqual("￼ABAA");
        expect(slices.get("M00000001")?.text).toEqual("￼B");
        expect(slices.get("M00000002")?.text).toEqual("￼C");
        expect(doc.text).toEqual("￼D");
      });

      test("start slice position matches", () => {
        const original = {
          text: "￼BAD",
          blocks: [
            {
              id: "B00000000",
              type: "paragraph",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],
          marks: [
            {
              id: "M00000000",
              type: "slice",
              range: "(1..3]",
              attributes: {
                refs: ["M00000000"],
              },
            },
            {
              id: "M00000001",
              type: "slice",
              range: "(1..2]",
              attributes: {
                retain: true,
                refs: ["B00000000"],
              },
            },
          ],
        };
        let [doc, slices] = extractSlices(original);
        expect(slices.get("M00000000")?.text).toEqual("￼BA");
        expect(slices.get("M00000001")?.text).toEqual("￼B");
        expect(doc.text).toEqual("￼D");
      });

      test("end slice position matches", () => {
        const original = {
          text: "￼ABD",
          blocks: [
            {
              id: "B00000000",
              type: "paragraph",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],
          marks: [
            {
              id: "M00000000",
              type: "slice",
              range: "(1..3]",
              attributes: {
                refs: ["M00000000"],
              },
            },
            {
              id: "M00000001",
              type: "slice",
              range: "(2..3]",
              attributes: {
                retain: true,
                refs: ["B00000000"],
              },
            },
          ],
        };
        let [doc, slices] = extractSlices(original);
        expect(slices.get("M00000000")?.text).toEqual("￼AB");
        expect(slices.get("M00000001")?.text).toEqual("￼B");
        expect(doc.text).toEqual("￼D");
      });

      test("multiple overlapping", () => {
        const original = {
          text: "￼ABCBD",
          blocks: [
            {
              id: "B00000000",
              type: "paragraph",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],
          marks: [
            {
              id: "M00000000",
              type: "slice",
              range: "(1..5]",
              attributes: {
                refs: ["M00000000"],
              },
            },
            {
              id: "M00000001",
              type: "slice",
              range: "(2..5]",
              attributes: {
                retain: true,
                refs: ["B00000000"],
              },
            },
            {
              id: "M00000002",
              type: "slice",
              range: "(3..4]",
              attributes: {
                retain: true,
                refs: ["B00000000"],
              },
            },
          ],
        };
        let [doc, slices] = extractSlices(original);
        expect(slices.get("M00000000")?.text).toEqual("￼ABCB");
        expect(slices.get("M00000001")?.text).toEqual("￼BCB");
        expect(slices.get("M00000002")?.text).toEqual("￼C");
        expect(doc.text).toEqual("￼D");
      });

      test("hanging overlapping slices (retain both)", () => {
        const original = {
          text: "￼ABCD",
          blocks: [
            {
              id: "B00000000",
              type: "paragraph",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],
          marks: [
            {
              id: "M00000000",
              type: "slice",
              range: "(1..3]",
              attributes: {
                retain: true,
                refs: ["M00000000"],
              },
            },
            {
              id: "M00000001",
              type: "slice",
              range: "(2..4]",
              attributes: {
                retain: true,
                refs: ["B00000000"],
              },
            },
          ],
        };
        let [doc, slices] = extractSlices(original);
        expect(slices.get("M00000000")?.text).toEqual("￼AB");
        expect(slices.get("M00000001")?.text).toEqual("￼BC");
        expect(doc.text).toEqual("￼ABCD");
      });

      test("hanging overlapping slices (retain first)", () => {
        const original = {
          text: "￼ABCD",
          blocks: [
            {
              id: "B00000000",
              type: "paragraph",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],
          marks: [
            {
              id: "M00000000",
              type: "slice",
              range: "(1..3]",
              attributes: {
                retain: true,
                refs: ["M00000000"],
              },
            },
            {
              id: "M00000001",
              type: "slice",
              range: "(2..4]",
              attributes: {
                refs: ["B00000000"],
              },
            },
          ],
        };
        let [doc, slices] = extractSlices(original);
        expect(slices.get("M00000000")?.text).toEqual("￼AB");
        expect(slices.get("M00000001")?.text).toEqual("￼BC");
        expect(doc.text).toEqual("￼AD");
      });

      test("hanging overlapping slices (retain last)", () => {
        const original = {
          text: "￼ABCD",
          blocks: [
            {
              id: "B00000000",
              type: "paragraph",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],
          marks: [
            {
              id: "M00000000",
              type: "slice",
              range: "(1..3]",
              attributes: {
                refs: ["M00000000"],
              },
            },
            {
              id: "M00000001",
              type: "slice",
              range: "(2..4]",
              attributes: {
                retain: true,
                refs: ["B00000000"],
              },
            },
          ],
        };
        let [doc, slices] = extractSlices(original);
        expect(slices.get("M00000000")?.text).toEqual("￼AB");
        expect(slices.get("M00000001")?.text).toEqual("￼BC");
        expect(doc.text).toEqual("￼CD");
      });
    });
  });
});

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

  describe("weird ck bug", () => {
    const example1 = {
      text: "￼￼￼Name￼Age￼Job￼Laios￼19￼Fighter￼Marcille￼50￼Mage￼Chilchuck￼29￼Trapsmith￼Senshi￼112￼Cook",
      blocks: [
        {
          id: "22d9c97b-ff4a-4eed-bbc7-d2555970bb2d",
          type: "table",
          parents: [],
          selfClosing: false,
          attributes: {
            dataSet: "64e70965-f06d-4bbe-b917-2a5fe50c6bf8",
            columns: [
              {
                name: "Name",
                slice: "e1458d1e-da47-4b78-b001-69b289708e75",
              },
              {
                name: "Age",
                slice: "b6a5f50f-7857-4c2f-a756-50e6fff60d02",
              },
              {
                name: "Job",
                slice: "545e74b6-1024-4554-8eb6-30ab7c456157",
              },
            ],
            showColumnHeaders: true,
          },
        },
        {
          id: "64e70965-f06d-4bbe-b917-2a5fe50c6bf8",
          type: "data-set",
          parents: ["table"],
          selfClosing: false,
          attributes: {
            schema: {
              Name: "rich_text",
              Age: "rich_text",
              Job: "rich_text",
            },
            records: [
              {
                Name: {
                  slice: "2c7b4ad9-0780-46b1-bcdd-b571f78eccd4",
                  jsonValue: "Laios",
                },
                Age: {
                  slice: "c79644a5-6633-42e4-b0ca-238284cfb8bd",
                  jsonValue: "19",
                },
                Job: {
                  slice: "2aa60e32-7a25-474b-bfb2-c17a1f5ff547",
                  jsonValue: "Fighter",
                },
              },
              {
                Name: {
                  slice: "ffccbc61-d64a-4db4-b335-c42721b33406",
                  jsonValue: "Marcille",
                },
                Age: {
                  slice: "dd72e1af-b133-4a0d-9611-93a1bbc14c5a",
                  jsonValue: "50",
                },
                Job: {
                  slice: "68939eac-5330-4d5e-92fc-c8704a92f4b1",
                  jsonValue: "Mage",
                },
              },
              {
                Name: {
                  slice: "d4ddfaf7-963c-4b46-9b0d-96525336ff0c",
                  jsonValue: "Chilchuck",
                },
                Age: {
                  slice: "272ee2c9-d445-4ce0-ada7-9e357896d383",
                  jsonValue: "29",
                },
                Job: {
                  slice: "d293ed7e-738f-41f1-b827-f31af79562ce",
                  jsonValue: "Trapsmith",
                },
              },
              {
                Name: {
                  slice: "15e93cd3-5007-4519-9bf7-48e8a209f1c1",
                  jsonValue: "Senshi",
                },
                Age: {
                  slice: "1912fe3e-3c09-4c02-8a57-5d6ef8448e43",
                  jsonValue: "112",
                },
                Job: {
                  slice: "13f25a6f-c009-492c-9d13-43696fdc2741",
                  jsonValue: "Cook",
                },
              },
            ],
          },
        },
        {
          id: "43760116-7d37-47d6-9e85-72bde766683d",
          type: "text",
          parents: ["table", "data-set"],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "ffb764fd-a73e-4e9a-ba8d-494ae95428fa",
          type: "text",
          parents: ["table", "data-set"],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "0691b6ce-888d-4c60-b8d7-215a5af84c9d",
          type: "text",
          parents: ["table", "data-set"],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "bfe818ad-a78c-4562-9ed8-cdf57b4ca782",
          type: "text",
          parents: ["table", "data-set"],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "04330eef-d24e-4417-865b-f13bdea44bef",
          type: "text",
          parents: ["table", "data-set"],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "f235f2fb-c299-41c6-87aa-033f02d96d52",
          type: "text",
          parents: ["table", "data-set"],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "9106b2f1-0590-4e09-a39e-649ad4b9b7ca",
          type: "text",
          parents: ["table", "data-set"],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "53c7f318-6b8f-4060-a976-3e6c4d8a5838",
          type: "text",
          parents: ["table", "data-set"],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "fb5c6608-188c-4711-9ad7-aafc985f4525",
          type: "text",
          parents: ["table", "data-set"],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "57c737a5-c86c-4d58-9408-2d31bfa23e93",
          type: "text",
          parents: ["table", "data-set"],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "e43cfe7d-c594-45e1-b2ab-9e8da463be31",
          type: "text",
          parents: ["table", "data-set"],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "86de8916-0655-4eb7-80f5-b91409558966",
          type: "text",
          parents: ["table", "data-set"],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "9423c530-a801-4c3c-be33-3c290fa1e2c6",
          type: "text",
          parents: ["table", "data-set"],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "a6e9a738-2a81-4547-960d-dc306a2b94da",
          type: "text",
          parents: ["table", "data-set"],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "a8f597ce-3bb8-450b-acd2-a753cf97feb9",
          type: "text",
          parents: ["table", "data-set"],
          selfClosing: false,
          attributes: {},
        },
      ],
      marks: [
        {
          id: "e1458d1e-da47-4b78-b001-69b289708e75",
          type: "slice",
          range: "(2..7]",
          attributes: {
            refs: ["64e70965-f06d-4bbe-b917-2a5fe50c6bf8"],
          },
        },
        {
          id: "b6a5f50f-7857-4c2f-a756-50e6fff60d02",
          type: "slice",
          range: "(7..11]",
          attributes: {
            refs: ["64e70965-f06d-4bbe-b917-2a5fe50c6bf8"],
          },
        },
        {
          id: "545e74b6-1024-4554-8eb6-30ab7c456157",
          type: "slice",
          range: "(11..15]",
          attributes: {
            refs: ["64e70965-f06d-4bbe-b917-2a5fe50c6bf8"],
          },
        },
        {
          id: "2c7b4ad9-0780-46b1-bcdd-b571f78eccd4",
          type: "slice",
          range: "(16..21]",
          attributes: {
            refs: ["64e70965-f06d-4bbe-b917-2a5fe50c6bf8"],
          },
        },
        {
          id: "c79644a5-6633-42e4-b0ca-238284cfb8bd",
          type: "slice",
          range: "(21..24]",
          attributes: {
            refs: ["64e70965-f06d-4bbe-b917-2a5fe50c6bf8"],
          },
        },
        {
          id: "2aa60e32-7a25-474b-bfb2-c17a1f5ff547",
          type: "slice",
          range: "(24..32]",
          attributes: {
            refs: ["64e70965-f06d-4bbe-b917-2a5fe50c6bf8"],
          },
        },
        {
          id: "ffccbc61-d64a-4db4-b335-c42721b33406",
          type: "slice",
          range: "(33..41]",
          attributes: {
            refs: ["64e70965-f06d-4bbe-b917-2a5fe50c6bf8"],
          },
        },
        {
          id: "dd72e1af-b133-4a0d-9611-93a1bbc14c5a",
          type: "slice",
          range: "(41..44]",
          attributes: {
            refs: ["64e70965-f06d-4bbe-b917-2a5fe50c6bf8"],
          },
        },
        {
          id: "68939eac-5330-4d5e-92fc-c8704a92f4b1",
          type: "slice",
          range: "(44..49]",
          attributes: {
            refs: ["64e70965-f06d-4bbe-b917-2a5fe50c6bf8"],
          },
        },
        {
          id: "d4ddfaf7-963c-4b46-9b0d-96525336ff0c",
          type: "slice",
          range: "(50..59]",
          attributes: {
            refs: ["64e70965-f06d-4bbe-b917-2a5fe50c6bf8"],
          },
        },
        {
          id: "272ee2c9-d445-4ce0-ada7-9e357896d383",
          type: "slice",
          range: "(59..62]",
          attributes: {
            refs: ["64e70965-f06d-4bbe-b917-2a5fe50c6bf8"],
          },
        },
        {
          id: "d293ed7e-738f-41f1-b827-f31af79562ce",
          type: "slice",
          range: "(62..72]",
          attributes: {
            refs: ["64e70965-f06d-4bbe-b917-2a5fe50c6bf8"],
          },
        },
        {
          id: "15e93cd3-5007-4519-9bf7-48e8a209f1c1",
          type: "slice",
          range: "(73..79]",
          attributes: {
            refs: ["64e70965-f06d-4bbe-b917-2a5fe50c6bf8"],
          },
        },
        {
          id: "1912fe3e-3c09-4c02-8a57-5d6ef8448e43",
          type: "slice",
          range: "(79..83]",
          attributes: {
            refs: ["64e70965-f06d-4bbe-b917-2a5fe50c6bf8"],
          },
        },
        {
          id: "13f25a6f-c009-492c-9d13-43696fdc2741",
          type: "slice",
          range: "(83..88]",
          attributes: {
            refs: ["64e70965-f06d-4bbe-b917-2a5fe50c6bf8"],
          },
        },
      ],
    };

    const example2 = {
      text: "￼￼￼Name￼Age￼Job",
      blocks: [
        {
          id: "22d9c97b-ff4a-4eed-bbc7-d2555970bb2d",
          type: "table",
          parents: [],
          selfClosing: false,
          attributes: {
            dataSet: "64e70965-f06d-4bbe-b917-2a5fe50c6bf8",
            columns: [
              {
                name: "Name",
                slice: "e1458d1e-da47-4b78-b001-69b289708e75",
              },
              {
                name: "Age",
                slice: "b6a5f50f-7857-4c2f-a756-50e6fff60d02",
              },
              {
                name: "Job",
                slice: "545e74b6-1024-4554-8eb6-30ab7c456157",
              },
            ],
            showColumnHeaders: true,
          },
        },
        {
          id: "64e70965-f06d-4bbe-b917-2a5fe50c6bf8",
          type: "data-set",
          parents: ["table"],
          selfClosing: false,
          attributes: {
            schema: {
              Name: "rich_text",
              Age: "rich_text",
              Job: "rich_text",
            },
            records: [],
          },
        },
        {
          id: "43760116-7d37-47d6-9e85-72bde766683d",
          type: "text",
          parents: ["table", "data-set"],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "ffb764fd-a73e-4e9a-ba8d-494ae95428fa",
          type: "text",
          parents: ["table", "data-set"],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "0691b6ce-888d-4c60-b8d7-215a5af84c9d",
          type: "text",
          parents: ["table", "data-set"],
          selfClosing: false,
          attributes: {},
        },
      ],
      marks: [
        {
          id: "e1458d1e-da47-4b78-b001-69b289708e75",
          type: "slice",
          range: "(2..7]",
          attributes: {
            refs: ["64e70965-f06d-4bbe-b917-2a5fe50c6bf8"],
          },
        },
        {
          id: "b6a5f50f-7857-4c2f-a756-50e6fff60d02",
          type: "slice",
          range: "(7..11]",
          attributes: {
            refs: ["64e70965-f06d-4bbe-b917-2a5fe50c6bf8"],
          },
        },
        {
          id: "545e74b6-1024-4554-8eb6-30ab7c456157",
          type: "slice",
          range: "(11..15]",
          attributes: {
            refs: ["64e70965-f06d-4bbe-b917-2a5fe50c6bf8"],
          },
        },
      ],
    };
    test("example1", () => {
      let [, slices] = extractSlices(example1);
      expect(slices.get("e1458d1e-da47-4b78-b001-69b289708e75")?.text).toBe(
        "￼Name"
      );
    });

    test("example2", () => {
      let [, slices] = extractSlices(example2);

      expect(slices.get("e1458d1e-da47-4b78-b001-69b289708e75")?.text).toBe(
        "￼Name"
      );
    });
  });
});

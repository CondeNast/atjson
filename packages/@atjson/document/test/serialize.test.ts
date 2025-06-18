import {
  ParseAnnotation,
  deserialize,
  serialize,
  UnknownAnnotation,
  is,
  SliceAnnotation,
  TextAnnotation,
} from "../src";
import TestSource, {
  Anchor,
  Paragraph,
  Bold,
  Italic,
  List,
  ListItem,
  LineBreak,
  Quote,
  Instagram,
} from "./test-source";
import { sortTokens, TokenType, Token, SortableToken } from "../src/serialize";

describe("serialize", () => {
  test("errors are thrown if uFFFC is included in text", () => {
    expect(() => {
      serialize(
        new TestSource({
          content:
            "<p>There's text that wasn't wrapped in a ParseAnnotation!</p>\uFFFC",
          annotations: [
            new ParseAnnotation({
              start: 0,
              end: 3,
            }),

            new Paragraph({
              start: 0,
              end: 61,
            }),

            new ParseAnnotation({
              start: 57,
              end: 61,
            }),

            new Instagram({
              start: 61,
              end: 62,
            }),
          ],
        }),
      );
    }).toThrowErrorMatchingInlineSnapshot(`
      "Text contains reserved character +uFFFC at index 61.

      in a ParseAnnotation!</p>￼
                               ^"
    `);
  });

  test("errors are when throwOnUnknown is passed in", () => {
    expect(() => {
      serialize(
        new TestSource({
          content: "Hello, world",
          annotations: [
            new Paragraph({
              start: 0,
              end: 12,
            }),
            new UnknownAnnotation({
              start: 8,
              end: 12,
              attributes: {
                type: "subscript",
                attributes: {},
              },
            }),
          ],
        }),
        { onUnknown: "throw" },
      );
    }).toThrowErrorMatchingInlineSnapshot(`
      "Unknown annotations were found:
      - subscript[8..12]"
    `);
  });

  describe("blocks", () => {
    test("single block", () => {
      expect(
        serialize(
          new TestSource({
            content: "Hello, world",
            annotations: [
              new Paragraph({
                start: 0,
                end: 12,
              }),
            ],
          }),
        ),
      ).toMatchObject({
        text: "\uFFFCHello, world",
        blocks: [
          {
            type: "paragraph",
            attributes: {},
          },
        ],
        marks: [],
      });
    });

    test("colinear marks & blocks", () => {
      expect(
        serialize(
          new TestSource({
            content: "Hello, world",
            annotations: [
              new Paragraph({
                start: 0,
                end: 12,
              }),
              new Italic({
                start: 0,
                end: 12,
              }),
            ],
          }),
        ),
      ).toMatchObject({
        text: "\uFFFCHello, world",
        blocks: [
          {
            type: "paragraph",
            attributes: {},
          },
        ],
        marks: [
          {
            type: "italic",
          },
        ],
      });
    });

    test("colinear marks", () => {
      expect(
        serialize(
          new TestSource({
            content: "Hello, world",
            annotations: [
              new Paragraph({
                start: 0,
                end: 12,
              }),
              new Italic({
                start: 0,
                end: 12,
              }),
              new Bold({
                start: 0,
                end: 12,
              }),
            ],
          }),
        ),
      ).toMatchObject({
        text: "\uFFFCHello, world",
        blocks: [
          {
            type: "paragraph",
            attributes: {},
          },
        ],
        marks: [
          {
            type: "bold",
            range: "(1..13]",
          },
          {
            type: "italic",
            range: "(1..13]",
          },
        ],
      });
    });

    test("objects", () => {
      expect(
        serialize(
          new TestSource({
            content: "Missy Elliott’s\uFFFC“Supa Dupa Fly”",
            annotations: [
              new LineBreak({
                start: 15,
                end: 16,
              }),
              new ParseAnnotation({
                start: 15,
                end: 16,
              }),
            ],
          }),
        ),
      ).toMatchObject({
        text: "\uFFFCMissy Elliott’s\uFFFC“Supa Dupa Fly”",
        blocks: [
          {
            type: "text",
            parents: [],
          },
          {
            type: "line-break",
            selfClosing: true,
            parents: ["text"],
            attributes: {},
          },
        ],
        marks: [],
      });
    });

    test("jagged list", () => {
      let doc = new TestSource({
        content: "one\ntwo",
        annotations: [
          new List({
            start: 0,
            end: 7,
            attributes: {
              type: "bulleted",
            },
          }),
          new ListItem({ start: 0, end: 3 }),
          new ListItem({ start: 4, end: 7 }),
        ],
      });

      expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
        {
          "blocks": [
            {
              "attributes": {
                "type": "bulleted",
              },
              "id": "B00000000",
              "parents": [],
              "selfClosing": false,
              "type": "list",
            },
            {
              "attributes": {},
              "id": "B00000001",
              "parents": [
                "list",
              ],
              "selfClosing": false,
              "type": "list-item",
            },
            {
              "attributes": {},
              "id": "B00000002",
              "parents": [
                "list",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000003",
              "parents": [
                "list",
              ],
              "selfClosing": false,
              "type": "list-item",
            },
          ],
          "marks": [],
          "text": "￼￼one￼
        ￼two",
        }
      `);
    });

    test("sparse blocks", () => {
      expect(
        serialize(
          new TestSource({
            content: "onetwothree",
            annotations: [
              new Paragraph({
                start: 3,
                end: 6,
              }),
            ],
          }),
        ),
      ).toMatchObject({
        text: "\uFFFCone\uFFFCtwo\uFFFCthree",
        blocks: [
          {
            type: "text",
            parents: [],
          },
          {
            type: "paragraph",
            parents: [],
          },
          {
            type: "text",
            parents: [],
          },
        ],
        marks: [],
      });
    });

    test("continuations in blocks", () => {
      expect(
        serialize(
          new TestSource({
            content: "onetwothreefour",
            annotations: [
              new Quote({
                start: 0,
                end: 11,
              }),
              new Paragraph({
                start: 3,
                end: 6,
              }),
            ],
          }),
        ),
      ).toMatchObject({
        text: "\uFFFCone\uFFFCtwo\uFFFCthree\uFFFCfour",
        blocks: [
          {
            type: "quote",
            parents: [],
          },
          {
            type: "paragraph",
            parents: ["quote"],
          },
          {
            type: "text",
            parents: ["quote"],
          },
          {
            type: "text",
            parents: [],
          },
        ],
        marks: [],
      });
    });

    test("text annotations", () => {
      expect(
        serialize(
          new TestSource({
            content:
              "\uFFFC\uFFFCWe ran together three sequences of the Sun taken in three different extreme ultraviolet wavelengths by our Solar Dynamic Observatory (SDO) to better illustrate how features that appear in one sequence are difficult, if not impossible, to see in the others (Mar. 20-21, 2018). In the red sequence, we can see very small jets of solar material burst from the Sun’s surface and some small prominences, bright features extending outward, at the edge, which are not easily discerned in the other two sequences.\nIn the second clip, we can readily observe a coronal hole, the large and dark region where the Sun's magnetic field is open to interplanetary space, though it is difficult to distinguish in the others.\nIn the third clip, we can see strands of plasma waving above the surface, especially above the one small, but bright, active region near the right edge.\nThese are just three of the 10 extreme ultraviolet wavelengths in which SDO images the Sun every 12 seconds every day. That's a lot of data and a lot of science!\nCredit: NASA/Solar Dynamics Observatory",
            annotations: [
              new Instagram({
                start: 0,
                end: 1064,
                attributes: {
                  url: "https://www.instagram.com/p/Bg15hWbn_Zj",
                  content: "M00000000",
                },
              }),
              new ParseAnnotation({
                start: 0,
                end: 1,
              }),
              new SliceAnnotation({
                start: 1,
                end: 1064,
              }),
              new ParseAnnotation({
                start: 1,
                end: 2,
              }),
              new TextAnnotation({
                start: 1,
                end: 1064,
              }),
              new LineBreak({
                start: 507,
                end: 508,
              }),
              new ParseAnnotation({
                start: 507,
                end: 508,
              }),
              new LineBreak({
                start: 709,
                end: 710,
              }),
              new ParseAnnotation({
                start: 709,
                end: 710,
              }),
              new LineBreak({
                start: 862,
                end: 863,
              }),
              new ParseAnnotation({
                start: 862,
                end: 863,
              }),
              new LineBreak({
                start: 1024,
                end: 1025,
              }),
              new ParseAnnotation({
                start: 1024,
                end: 1025,
              }),
            ],
          }),
          { withStableIds: true },
        ),
      ).toMatchInlineSnapshot(`
        {
          "blocks": [
            {
              "attributes": {
                "content": "M00000000",
                "url": "https://www.instagram.com/p/Bg15hWbn_Zj",
              },
              "id": "B00000000",
              "parents": [],
              "selfClosing": true,
              "type": "instagram",
            },
            {
              "attributes": {},
              "id": "B00000001",
              "parents": [
                "instagram",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000002",
              "parents": [
                "instagram",
                "text",
              ],
              "selfClosing": true,
              "type": "line-break",
            },
            {
              "attributes": {},
              "id": "B00000003",
              "parents": [
                "instagram",
                "text",
              ],
              "selfClosing": true,
              "type": "line-break",
            },
            {
              "attributes": {},
              "id": "B00000004",
              "parents": [
                "instagram",
                "text",
              ],
              "selfClosing": true,
              "type": "line-break",
            },
            {
              "attributes": {},
              "id": "B00000005",
              "parents": [
                "instagram",
                "text",
              ],
              "selfClosing": true,
              "type": "line-break",
            },
          ],
          "marks": [
            {
              "attributes": {},
              "id": "M00000000",
              "range": "(1..1064]",
              "type": "slice",
            },
          ],
          "text": "￼￼We ran together three sequences of the Sun taken in three different extreme ultraviolet wavelengths by our Solar Dynamic Observatory (SDO) to better illustrate how features that appear in one sequence are difficult, if not impossible, to see in the others (Mar. 20-21, 2018). In the red sequence, we can see very small jets of solar material burst from the Sun’s surface and some small prominences, bright features extending outward, at the edge, which are not easily discerned in the other two sequences.￼In the second clip, we can readily observe a coronal hole, the large and dark region where the Sun's magnetic field is open to interplanetary space, though it is difficult to distinguish in the others.￼In the third clip, we can see strands of plasma waving above the surface, especially above the one small, but bright, active region near the right edge.￼These are just three of the 10 extreme ultraviolet wavelengths in which SDO images the Sun every 12 seconds every day. That's a lot of data and a lot of science!￼Credit: NASA/Solar Dynamics Observatory",
        }
      `);
    });

    test("continuations in blocks with parse tokens", () => {
      expect(
        serialize(
          new TestSource({
            content:
              "<blockquote><p>“My main problem is that I have a lot of energy and I can’t say no,”</p><cite>Prue Leith</cite></blockquote>",
            annotations: [
              new ParseAnnotation({
                start: 0,
                end: 12,
              }),
              new ParseAnnotation({
                start: 12,
                end: 15,
              }),
              new Paragraph({
                start: 12,
                end: 87,
              }),
              new ParseAnnotation({
                start: 83,
                end: 87,
              }),
              new ParseAnnotation({
                start: 87,
                end: 93,
              }),
              new ParseAnnotation({
                start: 103,
                end: 110,
              }),
              new ParseAnnotation({
                start: 110,
                end: 123,
              }),
              new Quote({
                start: 0,
                end: 123,
              }),
              new SliceAnnotation({
                start: 87,
                end: 110,
              }),
            ],
          }),
        ),
      ).toMatchObject({
        text: "\uFFFC\uFFFC“My main problem is that I have a lot of energy and I can’t say no,”\uFFFCPrue Leith",
        blocks: [
          {
            type: "quote",
            parents: [],
          },
          {
            type: "paragraph",
            parents: ["quote"],
          },
          {
            type: "text",
            parents: ["quote"],
          },
        ],
        marks: [
          {
            type: "slice",
            range: "(70..81]",
          },
        ],
      });
    });

    test("multiple blocks", () => {
      expect(
        serialize(
          new TestSource({
            content: "one fishtwo fishred fishblue fish",
            annotations: [
              new Paragraph({
                start: 0,
                end: 8,
              }),
              new Paragraph({
                start: 8,
                end: 16,
              }),
              new Paragraph({
                start: 16,
                end: 24,
              }),
              new Paragraph({
                start: 24,
                end: 33,
              }),
            ],
          }),
        ),
      ).toMatchObject({
        text: "\uFFFCone fish\uFFFCtwo fish\uFFFCred fish\uFFFCblue fish",
        blocks: [
          {
            type: "paragraph",
            attributes: {},
          },
          {
            type: "paragraph",
            attributes: {},
          },
          {
            type: "paragraph",
            attributes: {},
          },
          {
            type: "paragraph",
            attributes: {},
          },
        ],
        marks: [],
      });
    });

    test("nested blocks", () => {
      expect(
        serialize(
          new TestSource({
            content: "one fishtwo fishred fishblue fish",
            annotations: [
              new List({
                start: 0,
                end: 33,
                attributes: {
                  type: "bulleted",
                },
              }),
              new ListItem({
                start: 0,
                end: 8,
              }),
              new ListItem({
                start: 8,
                end: 16,
              }),
              new ListItem({
                start: 16,
                end: 24,
              }),
              new ListItem({
                start: 24,
                end: 33,
              }),
            ],
          }),
        ),
      ).toMatchObject({
        text: "\uFFFC\uFFFCone fish\uFFFCtwo fish\uFFFCred fish\uFFFCblue fish",
        blocks: [
          {
            type: "list",
            attributes: {},
          },
          {
            type: "list-item",
            parents: ["list"],
            attributes: {},
          },
          {
            type: "list-item",
            parents: ["list"],
            attributes: {},
          },
          {
            type: "list-item",
            parents: ["list"],
            attributes: {},
          },
          {
            type: "list-item",
            parents: ["list"],
            attributes: {},
          },
        ],
        marks: [],
      });
    });
  });

  describe("marks", () => {
    test("ranges are adjusted for blocks", () => {
      expect(
        serialize(
          new TestSource({
            content: "hello, world",
            annotations: [
              new Paragraph({
                start: 0,
                end: 12,
              }),
              new Bold({
                start: 7,
                end: 12,
              }),
              new Italic({
                start: 7,
                end: 12,
              }),
            ],
          }),
        ),
      ).toMatchObject({
        text: "\uFFFChello, world",
        blocks: [
          {
            type: "paragraph",
            attributes: {},
          },
        ],
        marks: [
          {
            type: "bold",
            range: "(8..13]",
            attributes: {},
          },
          {
            type: "italic",
            range: "(8..13]",
            attributes: {},
          },
        ],
      });
    });

    test("unknown marks", () => {
      expect(
        serialize(
          new TestSource({
            content: "Hello, world",
            annotations: [
              new Paragraph({
                start: 0,
                end: 12,
              }),
              new UnknownAnnotation({
                start: 8,
                end: 12,
                attributes: {
                  type: "subscript",
                  attributes: {},
                },
              }),
            ],
          }),
        ),
      ).toMatchObject({
        text: "\uFFFCHello, world",
        blocks: [
          {
            type: "paragraph",
          },
        ],
        marks: [{ type: "subscript", range: "(9..13]" }],
      });
    });

    test("ranges are encoded with custom edge behaviour", () => {
      expect(
        serialize(
          new TestSource({
            content: "hello, world",
            annotations: [
              new Paragraph({
                start: 0,
                end: 12,
              }),
              new Anchor({
                start: 7,
                end: 12,
                attributes: {
                  href: "https://www.example.com",
                },
              }),
              new Italic({
                start: 7,
                end: 12,
              }),
            ],
          }),
        ),
      ).toMatchObject({
        text: "\uFFFChello, world",
        blocks: [
          {
            type: "paragraph",
            attributes: {},
          },
        ],
        marks: [
          {
            type: "a",
            range: "(8..13)",
            attributes: {
              href: "https://www.example.com",
            },
          },
          {
            type: "italic",
            range: "(8..13]",
            attributes: {},
          },
        ],
      });
    });

    describe("parse tokens", () => {
      test("range shifting", () => {
        expect(
          serialize(
            new TestSource({
              content: "hello, \uFFFCworld\uFFFC",
              annotations: [
                new Paragraph({
                  start: 0,
                  end: 14,
                }),
                new ParseAnnotation({
                  start: 7,
                  end: 8,
                }),
                new Anchor({
                  start: 7,
                  end: 14,
                  attributes: {
                    href: "https://www.example.com",
                  },
                }),
                new Italic({
                  start: 7,
                  end: 14,
                }),
                new ParseAnnotation({
                  start: 13,
                  end: 14,
                }),
              ],
            }),
          ),
        ).toMatchObject({
          text: "\uFFFChello, world",
          blocks: [
            {
              type: "paragraph",
              attributes: {},
            },
          ],
          marks: [
            {
              type: "a",
              range: "(8..13)",
              attributes: {
                href: "https://www.example.com",
              },
            },
            {
              type: "italic",
              range: "(8..13]",
              attributes: {},
            },
          ],
        });
      });

      test("includeParseTokens = true", () => {
        expect(
          serialize(
            new TestSource({
              content: "<p>hello, <em>world</em></p>",
              annotations: [
                new Paragraph({
                  start: 0,
                  end: 28,
                }),
                new ParseAnnotation({
                  start: 0,
                  end: 3,
                }),
                new Italic({
                  start: 10,
                  end: 24,
                  attributes: {},
                }),
                new ParseAnnotation({
                  start: 10,
                  end: 14,
                }),
                new ParseAnnotation({
                  start: 19,
                  end: 24,
                }),
                new ParseAnnotation({
                  start: 24,
                  end: 28,
                }),
              ],
            }),
            { includeParseTokens: true, withStableIds: true },
          ),
        ).toMatchInlineSnapshot(`
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
                "range": "(1..4]",
                "type": "parse-token",
              },
              {
                "attributes": {},
                "id": "M00000001",
                "range": "(11..15]",
                "type": "parse-token",
              },
              {
                "attributes": {},
                "id": "M00000002",
                "range": "(11..25]",
                "type": "italic",
              },
              {
                "attributes": {},
                "id": "M00000003",
                "range": "(20..25]",
                "type": "parse-token",
              },
              {
                "attributes": {},
                "id": "M00000004",
                "range": "(25..29]",
                "type": "parse-token",
              },
            ],
            "text": "￼<p>hello, <em>world</em></p>",
          }
        `);
      });

      test("includeParseTokens = false", () => {
        expect(
          serialize(
            new TestSource({
              content: "<p>hello, <em>world</em></p>",
              annotations: [
                new Paragraph({
                  start: 0,
                  end: 28,
                }),
                new ParseAnnotation({
                  start: 0,
                  end: 3,
                }),
                new Italic({
                  start: 10,
                  end: 24,
                  attributes: {},
                }),
                new ParseAnnotation({
                  start: 10,
                  end: 14,
                }),
                new ParseAnnotation({
                  start: 19,
                  end: 24,
                }),
                new ParseAnnotation({
                  start: 24,
                  end: 28,
                }),
              ],
            }),
            { includeParseTokens: false, withStableIds: true },
          ),
        ).toMatchInlineSnapshot(`
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
                "range": "(8..13]",
                "type": "italic",
              },
            ],
            "text": "￼hello, world",
          }
        `);
      });

      test("text block insertion", () => {
        expect(
          serialize(
            new TestSource({
              content: "\uFFFChello, world",
              annotations: [
                new Paragraph({
                  start: 1,
                  end: 13,
                }),
                new ParseAnnotation({
                  start: 0,
                  end: 1,
                }),
              ],
            }),
          ),
        ).toMatchObject({
          text: "\uFFFChello, world",
          blocks: [
            {
              type: "paragraph",
              attributes: {},
            },
          ],
          marks: [],
        });
      });

      test("text block insertion", () => {
        expect(
          serialize(
            new TestSource({
              content: "\uFFFChello, world\uFFFChi",
              annotations: [
                new Paragraph({
                  start: 1,
                  end: 13,
                }),
                new ParseAnnotation({
                  start: 0,
                  end: 1,
                }),
                new ParseAnnotation({
                  start: 13,
                  end: 14,
                }),
              ],
            }),
          ),
        ).toMatchObject({
          text: "\uFFFChello, world\uFFFChi",
          blocks: [
            {
              type: "paragraph",
              attributes: {},
            },
            {
              type: "text",
              attributes: {},
            },
          ],
          marks: [],
        });
      });
    });

    test("0 length marks with parse end and block start are sorted start -> end", () => {
      // Test a specific edge case where the bold annotation at position 1412 produced a mark with a malformed range
      // The conditions for this are specific to the way the tokens generated from the annotations are divided during
      // the sorting process, hence the length of the test document. The requirements for this edge case seem to be:
      // * some minimum number of annotations
      // * a zero-length mark coinciding with a block start and parse end
      let doc = new TestSource({
        content:
          "You have a lot of movies coming out again this year. Foe with Saoirse Ronan, and the Andrew Haigh movie. Are you looking forward to another round of getting these movies out there?\nI’m so excited. So I’m actually going to see Foe with Saoirse this week. She saw it and seemed to be really happy with it, so I’m really excited to see that. The Andrew Haigh film, I play opposite Andrew Scott. I probably can’t say a lot about it other than the fact that I think Andrew Scott is going to be—touch wood, from my watching on my end, that was beautiful.His performance was so good, just being beside him. I’m just looking forward to seeing it cut together. It’s that thing of hearing people who are working on the film being really excited about is a good place to be now.\nThat’s probably somewhat similar to Aftersun, right?\nYes. I want to stay in this feeling of looking forward. I don’t think, post-Normal People, that I have never not been looking forward to the next thing that I’m doing. That is remaining true. I feel like I’m starting to be a little bit tired, which is a good feeling, because it means I’m just going to push for another year and a half. Maybe famous last words. [Laughs] I feel the anxiety of taking a break.\nI read that you considered appendicitis a break. Like, a needed break. \nOh yeah. It was a break, like a big old break. [Laughs] Couldn’t do anything for 10 days. It was a nightmare.\nYou should get to a place where you don’t need to get appendicitis to take 10 days off.",
        annotations: [
          {
            id: "5874124f-16da-4b65-96b5-48cade048229",
            type: "-test-paragraph",
            start: 0,
            end: 180,
            attributes: {},
          },
          {
            id: "19baaa27-d00b-4514-aa58-d489ac5e444e",
            type: "-test-bold",
            start: 0,
            end: 180,
            attributes: {},
          },
          {
            id: "fa0d177c-9e7e-4361-89b7-e82d95c5672b",
            type: "-test-italic",
            start: 53,
            end: 57,
            attributes: {},
          },
          {
            id: "364d9ff4-6546-4862-a538-78dacfb1e102",
            type: "-atjson-parse-token",
            start: 180,
            end: 181,
            attributes: {
              "-atjson-reason": "paragraph boundary",
            },
          },
          {
            id: "e2999017-67c6-44b3-9d01-650b4198b139",
            type: "-test-paragraph",
            start: 181,
            end: 767,
            attributes: {},
          },
          {
            id: "ef791cea-3431-4d49-8340-01df2e340458",
            type: "-test-italic",
            start: 226,
            end: 229,
            attributes: {},
          },
          {
            id: "54669f82-75cc-4307-b7c1-103aaa27fd70",
            type: "-test-bold",
            start: 378,
            end: 392,
            attributes: {},
          },
          {
            id: "b5e4f841-a897-4c81-82d9-141ec6b3754f",
            type: "-atjson-parse-token",
            start: 767,
            end: 768,
            attributes: {
              "-atjson-reason": "paragraph boundary",
            },
          },
          {
            id: "c7d0f785-1353-4f66-99d2-c098633374fd",
            type: "-test-bold",
            start: 768,
            end: 821,
            attributes: {},
          },
          {
            id: "3df11196-7a35-4737-b485-055a59b93707",
            type: "-test-paragraph",
            start: 768,
            end: 820,
            attributes: {},
          },
          {
            id: "d03fbc48-a9f2-4e92-a949-076b6ac24bf1",
            type: "-test-italic",
            start: 804,
            end: 812,
            attributes: {},
          },
          {
            id: "aec708b4-268f-4574-a338-92930c3c60e9",
            type: "-atjson-parse-token",
            start: 820,
            end: 821,
            attributes: {
              "-atjson-reason": "paragraph boundary",
            },
          },
          {
            id: "af0c3bd4-afb8-4a9c-b148-c8a6888b2bdd",
            type: "-test-paragraph",
            start: 821,
            end: 1229,
            attributes: {},
          },
          {
            id: "843b6925-17f2-41b6-ac6a-1bd9eb2233d9",
            type: "-test-italic",
            start: 897,
            end: 910,
            attributes: {},
          },
          {
            id: "6bcc0cc0-362c-495c-98a1-2fc92054d01e",
            type: "-test-italic",
            start: 1184,
            end: 1190,
            attributes: {},
          },
          {
            id: "4d774e13-1eac-4fa4-8f32-0662135f788b",
            type: "-atjson-parse-token",
            start: 1229,
            end: 1230,
            attributes: {
              "-atjson-reason": "paragraph boundary",
            },
          },
          {
            id: "91b38eac-f763-48c7-8edc-3461385f2968",
            type: "-test-bold",
            start: 1230,
            end: 1302,
            attributes: {},
          },
          {
            id: "e34d4658-9387-4f17-9c07-826534fe4259",
            type: "-test-paragraph",
            start: 1230,
            end: 1301,
            attributes: {},
          },
          {
            id: "e769099f-2955-43b0-8dc1-dc455f9f196f",
            type: "-atjson-parse-token",
            start: 1301,
            end: 1302,
            attributes: {
              "-atjson-reason": "paragraph boundary",
            },
          },
          {
            id: "b8021f1b-db59-436c-a7ee-533ba6deec7e",
            type: "-test-paragraph",
            start: 1302,
            end: 1411,
            attributes: {},
          },
          {
            id: "bbfcda81-c8d6-43de-92b1-ab867084b5a8",
            type: "-test-italic",
            start: 1350,
            end: 1356,
            attributes: {},
          },
          {
            id: "5d58d326-c98e-4529-be89-54e6fcff9238",
            type: "-atjson-parse-token",
            start: 1411,
            end: 1412,
            attributes: {
              "-atjson-reason": "paragraph boundary",
            },
          },
          {
            id: "4427e2c5-eca8-451a-ad88-3c9a548d3e5b",
            type: "-test-paragraph",
            start: 1412,
            end: 1499,
            attributes: {},
          },
          {
            id: "5d58d326-c98e-4529-be89-54e6fcff92ab",
            type: "-test-bold",
            start: 1412,
            end: 1412,
            attributes: {},
          },
        ],
      });

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
              "attributes": {},
              "id": "B00000001",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000002",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000003",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000004",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000005",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000006",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
          ],
          "marks": [
            {
              "attributes": {},
              "id": "M00000000",
              "range": "(1..181]",
              "type": "bold",
            },
            {
              "attributes": {},
              "id": "M00000001",
              "range": "(54..58]",
              "type": "italic",
            },
            {
              "attributes": {},
              "id": "M00000002",
              "range": "(227..230]",
              "type": "italic",
            },
            {
              "attributes": {},
              "id": "M00000003",
              "range": "(379..393]",
              "type": "bold",
            },
            {
              "attributes": {},
              "id": "M00000004",
              "range": "(768..821]",
              "type": "bold",
            },
            {
              "attributes": {},
              "id": "M00000005",
              "range": "(805..813]",
              "type": "italic",
            },
            {
              "attributes": {},
              "id": "M00000006",
              "range": "(898..911]",
              "type": "italic",
            },
            {
              "attributes": {},
              "id": "M00000007",
              "range": "(1185..1191]",
              "type": "italic",
            },
            {
              "attributes": {},
              "id": "M00000008",
              "range": "(1230..1302]",
              "type": "bold",
            },
            {
              "attributes": {},
              "id": "M00000009",
              "range": "(1351..1357]",
              "type": "italic",
            },
            {
              "attributes": {},
              "id": "M0000000a",
              "range": "(1412..1412]",
              "type": "bold",
            },
          ],
          "text": "￼You have a lot of movies coming out again this year. Foe with Saoirse Ronan, and the Andrew Haigh movie. Are you looking forward to another round of getting these movies out there?￼I’m so excited. So I’m actually going to see Foe with Saoirse this week. She saw it and seemed to be really happy with it, so I’m really excited to see that. The Andrew Haigh film, I play opposite Andrew Scott. I probably can’t say a lot about it other than the fact that I think Andrew Scott is going to be—touch wood, from my watching on my end, that was beautiful.His performance was so good, just being beside him. I’m just looking forward to seeing it cut together. It’s that thing of hearing people who are working on the film being really excited about is a good place to be now.￼That’s probably somewhat similar to Aftersun, right?￼Yes. I want to stay in this feeling of looking forward. I don’t think, post-Normal People, that I have never not been looking forward to the next thing that I’m doing. That is remaining true. I feel like I’m starting to be a little bit tired, which is a good feeling, because it means I’m just going to push for another year and a half. Maybe famous last words. [Laughs] I feel the anxiety of taking a break.￼I read that you considered appendicitis a break. Like, a needed break. ￼Oh yeah. It was a break, like a big old break. [Laughs] Couldn’t do anything for 10 days. It was a nightmare.￼You should get to a place where you don’t need to get appendicitis to take 10 days off.",
        }
      `);
    });

    test("0 length marks are sorted start -> end", () => {
      let paragraph = new Paragraph({
        id: "B00000000",
        start: 0,
        end: 5,
      });
      let bold = new Bold({
        id: "M00000000",
        start: 1,
        end: 1,
      });
      let italic = new Italic({
        id: "M00000001",
        start: 3,
        end: 3,
      });
      let tokens = [
        {
          annotation: paragraph,
          type: "block",
          edgeBehaviour: Paragraph.edgeBehaviour,
        },
        {
          annotation: bold,
          type: "mark",
          edgeBehaviour: Bold.edgeBehaviour,
        },
        {
          annotation: italic,
          type: "mark",
          edgeBehaviour: Italic.edgeBehaviour,
        },
      ].reduce((E, description) => {
        E.push(
          {
            type:
              description.type === "block"
                ? TokenType.BLOCK_END
                : TokenType.MARK_END,
            index: description.annotation.start,
            annotation: description.annotation,
            shared: { start: -1 },
            selfClosing: false,
            edgeBehaviour: description.edgeBehaviour,
          },
          {
            type:
              description.type === "block"
                ? TokenType.BLOCK_START
                : TokenType.MARK_START,
            index: description.annotation.start,
            annotation: description.annotation,
            shared: { start: -1 },
            selfClosing: false,
            edgeBehaviour: description.edgeBehaviour,
          },
        );
        return E;
      }, [] as Token[]);

      tokens.sort(sortTokens);

      expect(
        tokens.map((token) => {
          switch (token.type) {
            case TokenType.BLOCK_START:
              return { id: token.annotation.id, type: "BLOCK_START" };
            case TokenType.BLOCK_END:
              return { id: token.annotation.id, type: "BLOCK_END" };
            case TokenType.MARK_START:
              return { id: token.annotation.id, type: "MARK_START" };
            case TokenType.MARK_END:
              return { id: token.annotation.id, type: "MARK_END" };
            case TokenType.PARSE_START:
              return { id: token.annotation.id, type: "PARSE_START" };
            case TokenType.PARSE_END:
              return { id: token.annotation.id, type: "PARSE_END" };
          }
        }),
      ).toMatchInlineSnapshot(`
        [
          {
            "id": "B00000000",
            "type": "BLOCK_START",
          },
          {
            "id": "B00000000",
            "type": "BLOCK_END",
          },
          {
            "id": "M00000000",
            "type": "MARK_START",
          },
          {
            "id": "M00000000",
            "type": "MARK_END",
          },
          {
            "id": "M00000001",
            "type": "MARK_START",
          },
          {
            "id": "M00000001",
            "type": "MARK_END",
          },
        ]
      `);
    });
  });
});

describe("deserialize", () => {
  describe("blocks", () => {
    test("single block", () => {
      expect(
        deserialize(
          {
            text: "\uFFFCHello, world",
            blocks: [
              { id: "B01", type: "paragraph", attributes: {}, parents: [] },
            ],
          },

          TestSource,
        )
          .withStableIds()
          .toJSON(),
      ).toMatchInlineSnapshot(`
        {
          "annotations": [
            {
              "attributes": {},
              "end": 13,
              "id": "00000001",
              "start": 0,
              "type": "-test-paragraph",
            },
            {
              "attributes": {},
              "end": 1,
              "id": "00000002",
              "start": 0,
              "type": "-atjson-parse-token",
            },
          ],
          "content": "￼Hello, world",
          "contentType": "application/vnd.atjson+test",
          "schema": [
            "-test-a",
            "-test-bold",
            "-test-code",
            "-test-image",
            "-test-instagram",
            "-test-italic",
            "-test-locale",
            "-test-line-break",
            "-test-list",
            "-test-list-item",
            "-test-manual",
            "-test-paragraph",
            "-test-pre",
            "-test-quote",
          ],
        }
      `);
    });

    test("objects", () => {
      expect(
        deserialize(
          {
            text: "Missy Elliott’s\uFFFC“Supa Dupa Fly”",
            blocks: [
              {
                id: "B01",
                type: "line-break",
                selfClosing: true,
                parents: [],
                attributes: {},
              },
            ],
          },
          TestSource,
        )
          .withStableIds()
          .toJSON(),
      ).toMatchInlineSnapshot(`
        {
          "annotations": [
            {
              "attributes": {},
              "end": 16,
              "id": "00000001",
              "start": 15,
              "type": "-test-line-break",
            },
            {
              "attributes": {},
              "end": 16,
              "id": "00000002",
              "start": 15,
              "type": "-atjson-parse-token",
            },
          ],
          "content": "Missy Elliott’s￼“Supa Dupa Fly”",
          "contentType": "application/vnd.atjson+test",
          "schema": [
            "-test-a",
            "-test-bold",
            "-test-code",
            "-test-image",
            "-test-instagram",
            "-test-italic",
            "-test-locale",
            "-test-line-break",
            "-test-list",
            "-test-list-item",
            "-test-manual",
            "-test-paragraph",
            "-test-pre",
            "-test-quote",
          ],
        }
      `);
    });

    test("nested blocks", () => {
      expect(
        deserialize(
          {
            text: "\uFFFC\uFFFC\uFFFCone fish\uFFFC\uFFFCtwo fish\uFFFC\uFFFCred fish\uFFFC\uFFFCblue fish",
            blocks: [
              {
                id: "B01",
                type: "list",
                selfClosing: false,
                parents: [],
                attributes: {},
              },
              {
                id: "B02",
                type: "list-item",
                selfClosing: false,
                parents: ["list"],
                attributes: {},
              },
              {
                id: "B03",
                type: "paragraph",
                selfClosing: false,
                parents: ["list", "list-item"],
                attributes: {},
              },
              {
                id: "B04",
                type: "list-item",
                selfClosing: false,
                parents: ["list"],
                attributes: {},
              },
              {
                id: "B05",
                type: "paragraph",
                selfClosing: false,
                parents: ["list", "list-item"],
                attributes: {},
              },
              {
                id: "B06",
                type: "list-item",
                selfClosing: false,
                parents: ["list"],
                attributes: {},
              },
              {
                id: "B07",
                type: "paragraph",
                selfClosing: false,
                parents: ["list", "list-item"],
                attributes: {},
              },
              {
                id: "B08",
                type: "list-item",
                selfClosing: false,
                parents: ["list"],
                attributes: {},
              },
              {
                id: "B09",
                type: "paragraph",
                selfClosing: false,
                parents: ["list", "list-item"],
                attributes: {},
              },
            ],
          },
          TestSource,
        )
          .withStableIds()
          .toJSON(),
      ).toMatchInlineSnapshot(`
        {
          "annotations": [
            {
              "attributes": {},
              "end": 42,
              "id": "00000001",
              "start": 0,
              "type": "-test-list",
            },
            {
              "attributes": {},
              "end": 1,
              "id": "00000002",
              "start": 0,
              "type": "-atjson-parse-token",
            },
            {
              "attributes": {},
              "end": 11,
              "id": "00000003",
              "start": 1,
              "type": "-test-list-item",
            },
            {
              "attributes": {},
              "end": 2,
              "id": "00000004",
              "start": 1,
              "type": "-atjson-parse-token",
            },
            {
              "attributes": {},
              "end": 11,
              "id": "00000005",
              "start": 2,
              "type": "-test-paragraph",
            },
            {
              "attributes": {},
              "end": 3,
              "id": "00000006",
              "start": 2,
              "type": "-atjson-parse-token",
            },
            {
              "attributes": {},
              "end": 21,
              "id": "00000007",
              "start": 11,
              "type": "-test-list-item",
            },
            {
              "attributes": {},
              "end": 12,
              "id": "00000008",
              "start": 11,
              "type": "-atjson-parse-token",
            },
            {
              "attributes": {},
              "end": 21,
              "id": "00000009",
              "start": 12,
              "type": "-test-paragraph",
            },
            {
              "attributes": {},
              "end": 13,
              "id": "0000000a",
              "start": 12,
              "type": "-atjson-parse-token",
            },
            {
              "attributes": {},
              "end": 31,
              "id": "0000000b",
              "start": 21,
              "type": "-test-list-item",
            },
            {
              "attributes": {},
              "end": 22,
              "id": "0000000c",
              "start": 21,
              "type": "-atjson-parse-token",
            },
            {
              "attributes": {},
              "end": 31,
              "id": "0000000d",
              "start": 22,
              "type": "-test-paragraph",
            },
            {
              "attributes": {},
              "end": 23,
              "id": "0000000e",
              "start": 22,
              "type": "-atjson-parse-token",
            },
            {
              "attributes": {},
              "end": 42,
              "id": "0000000f",
              "start": 31,
              "type": "-test-list-item",
            },
            {
              "attributes": {},
              "end": 32,
              "id": "00000010",
              "start": 31,
              "type": "-atjson-parse-token",
            },
            {
              "attributes": {},
              "end": 42,
              "id": "00000011",
              "start": 32,
              "type": "-test-paragraph",
            },
            {
              "attributes": {},
              "end": 33,
              "id": "00000012",
              "start": 32,
              "type": "-atjson-parse-token",
            },
          ],
          "content": "￼￼￼one fish￼￼two fish￼￼red fish￼￼blue fish",
          "contentType": "application/vnd.atjson+test",
          "schema": [
            "-test-a",
            "-test-bold",
            "-test-code",
            "-test-image",
            "-test-instagram",
            "-test-italic",
            "-test-locale",
            "-test-line-break",
            "-test-list",
            "-test-list-item",
            "-test-manual",
            "-test-paragraph",
            "-test-pre",
            "-test-quote",
          ],
        }
      `);
    });

    test("unknown blocks", () => {
      let doc = deserialize(
        {
          text: "\uFFFChello",
          blocks: [
            {
              id: "B01",
              type: "blockquote",
              selfClosing: false,
              parents: [],
              attributes: {
                align: "left",
              },
            },
          ],
        },
        TestSource,
      );
      let unknown = [...doc.where((a) => is(a, UnknownAnnotation))];
      expect(unknown.length).toBe(1);
      expect(unknown[0].attributes).toMatchObject({
        type: "blockquote",
        attributes: { align: "left" },
      });
    });

    test("unknown marks", () => {
      let doc = deserialize(
        {
          text: "\uFFFChello",
          blocks: [
            {
              id: "B01",
              type: "paragraph",
              selfClosing: false,
              parents: [],
              attributes: {},
            },
          ],
          marks: [
            {
              id: "M01",
              type: "internalLink",
              range: "[1..6]",
              attributes: {
                urn: "foo",
              },
            },
          ],
        },
        TestSource,
      );
      let unknown = [...doc.where((a) => is(a, UnknownAnnotation))];
      expect(unknown.length).toBe(1);
      expect(unknown[0].attributes).toMatchObject({
        type: "internalLink",
        attributes: { urn: "foo" },
      });
    });

    test("jagged blocks", () => {
      expect(
        deserialize(
          {
            text: "\uFFFC\uFFFCone\uFFFCtwo",
            blocks: [
              {
                id: "B01",
                type: "quote",
                selfClosing: false,
                parents: [],
                attributes: {},
              },
              {
                id: "B02",
                type: "paragraph",
                selfClosing: false,
                parents: ["quote"],
                attributes: {},
              },
              {
                id: "B03",
                type: "paragraph",
                selfClosing: false,
                parents: [],
                attributes: {},
              },
            ],
          },
          TestSource,
        )
          .withStableIds()
          .toJSON(),
      ).toMatchInlineSnapshot(`
        {
          "annotations": [
            {
              "attributes": {},
              "end": 5,
              "id": "00000001",
              "start": 0,
              "type": "-test-quote",
            },
            {
              "attributes": {},
              "end": 1,
              "id": "00000002",
              "start": 0,
              "type": "-atjson-parse-token",
            },
            {
              "attributes": {},
              "end": 5,
              "id": "00000003",
              "start": 1,
              "type": "-test-paragraph",
            },
            {
              "attributes": {},
              "end": 2,
              "id": "00000004",
              "start": 1,
              "type": "-atjson-parse-token",
            },
            {
              "attributes": {},
              "end": 9,
              "id": "00000005",
              "start": 5,
              "type": "-test-paragraph",
            },
            {
              "attributes": {},
              "end": 6,
              "id": "00000006",
              "start": 5,
              "type": "-atjson-parse-token",
            },
          ],
          "content": "￼￼one￼two",
          "contentType": "application/vnd.atjson+test",
          "schema": [
            "-test-a",
            "-test-bold",
            "-test-code",
            "-test-image",
            "-test-instagram",
            "-test-italic",
            "-test-locale",
            "-test-line-break",
            "-test-list",
            "-test-list-item",
            "-test-manual",
            "-test-paragraph",
            "-test-pre",
            "-test-quote",
          ],
        }
      `);
    });

    test("malformed ranges throw errors", () => {
      expect(() =>
        deserialize(
          {
            text: "\uFFFCoops",
            blocks: [
              {
                id: "B01",
                type: "paragraph",
                selfClosing: false,
                parents: [],
                attributes: {},
              },
            ],
            marks: [
              {
                id: "M01",
                type: "error",
                // @ts-expect-error We're testing malformed ranges
                range: "{1..3]",
                attributes: {},
              },
            ],
          },
          TestSource,
        ),
      ).toThrow();
    });
  });

  describe("sortTokens", () => {
    test("colinear marks have a stable sort", () => {
      let paragraph = new Paragraph({
        start: 0,
        end: 5,
      });
      let bold = new Bold({
        start: 1,
        end: 3,
      });
      let italic = new Italic({
        start: 1,
        end: 3,
      });
      let tokens = [
        {
          annotation: paragraph,
          type: "block",
          edgeBehaviour: Paragraph.edgeBehaviour,
        },
        {
          annotation: bold,
          type: "mark",
          edgeBehaviour: Bold.edgeBehaviour,
        },
        {
          annotation: italic,
          type: "mark",
          edgeBehaviour: Italic.edgeBehaviour,
        },
      ].reduce((E, description) => {
        E.push(
          {
            type:
              description.type === "block"
                ? TokenType.BLOCK_START
                : TokenType.MARK_START,
            index: description.annotation.start,
            annotation: description.annotation,
            shared: { start: -1 },
            selfClosing: false,
            edgeBehaviour: description.edgeBehaviour,
          },
          {
            type:
              description.type === "block"
                ? TokenType.BLOCK_END
                : TokenType.MARK_END,
            index: description.annotation.start,
            annotation: description.annotation,
            shared: { start: -1 },
            selfClosing: false,
            edgeBehaviour: description.edgeBehaviour,
          },
        );
        return E;
      }, [] as Token[]);

      tokens.sort(sortTokens);
    });
  });
});

describe.skip("sorting tokens", () => {
  /**
   * these tests reveal an issue in the serialize function where zero-length blocks
   * have their starts and ends sorted in an arbitrary order--and may be separated by
   * other blocks' starts and ends at the same position.
   *
   * If these tests are being skipped, the bug is probably still present
   */
  test("sorts 0 length blocks test 1", () => {
    let tokens: SortableToken[] = [
      {
        index: 0,
        type: TokenType.BLOCK_END,
        annotation: { id: "1", start: 0, end: 0, rank: 5, type: "div" },
      },
      {
        index: 0,
        type: TokenType.BLOCK_START,
        annotation: { id: "2", start: 0, end: 5, rank: 5, type: "div" },
      },
      {
        index: 10,
        type: TokenType.BLOCK_END,
        annotation: { id: "3", start: 0, end: 10, rank: 5, type: "div" },
      },
      {
        index: 0,
        type: TokenType.BLOCK_START,
        annotation: { id: "3", start: 0, end: 10, rank: 5, type: "div" },
      },
      {
        index: 0,
        type: TokenType.BLOCK_START,
        annotation: { id: "1", start: 0, end: 0, rank: 5, type: "div" },
      },
      {
        index: 5,
        type: TokenType.BLOCK_END,
        annotation: { id: "2", start: 0, end: 5, rank: 5, type: "div" },
      },
    ];

    let sortedTokens: SortableToken[] = [
      {
        index: 0,
        type: TokenType.BLOCK_START,
        annotation: { id: "1", start: 0, end: 0, rank: 5, type: "div" },
      },
      {
        index: 0,
        type: TokenType.BLOCK_END,
        annotation: { id: "1", start: 0, end: 0, rank: 5, type: "div" },
      },
      {
        index: 0,
        type: TokenType.BLOCK_START,
        annotation: { id: "3", start: 0, end: 10, rank: 5, type: "div" },
      },
      {
        index: 0,
        type: TokenType.BLOCK_START,
        annotation: { id: "2", start: 0, end: 5, rank: 5, type: "div" },
      },
      {
        index: 5,
        type: TokenType.BLOCK_END,
        annotation: { id: "2", start: 0, end: 5, rank: 5, type: "div" },
      },
      {
        index: 10,
        type: TokenType.BLOCK_END,
        annotation: { id: "3", start: 0, end: 10, rank: 5, type: "div" },
      },
    ];

    tokens.sort(sortTokens);

    expect(tokens).toMatchObject(sortedTokens);
  });
  test("sorts 0 length blocks test 2", () => {
    let tokens: SortableToken[] = [
      {
        index: 0,
        type: TokenType.BLOCK_END,
        annotation: { id: "1", start: 0, end: 0, rank: 5, type: "div" },
      },
      {
        index: 0,
        type: TokenType.BLOCK_START,
        annotation: { id: "2", start: 0, end: 5, rank: 5, type: "div" },
      },
      {
        index: 0,
        type: TokenType.BLOCK_START,
        annotation: { id: "1", start: 0, end: 0, rank: 5, type: "div" },
      },
      {
        index: 5,
        type: TokenType.BLOCK_END,
        annotation: { id: "2", start: 0, end: 5, rank: 5, type: "div" },
      },
    ];

    let sortedTokens: SortableToken[] = [
      {
        index: 0,
        type: TokenType.BLOCK_START,
        annotation: { id: "1", start: 0, end: 0, rank: 5, type: "div" },
      },
      {
        index: 0,
        type: TokenType.BLOCK_END,
        annotation: { id: "1", start: 0, end: 0, rank: 5, type: "div" },
      },
      {
        index: 0,
        type: TokenType.BLOCK_START,
        annotation: { id: "2", start: 0, end: 5, rank: 5, type: "div" },
      },
      {
        index: 5,
        type: TokenType.BLOCK_END,
        annotation: { id: "2", start: 0, end: 5, rank: 5, type: "div" },
      },
    ];

    tokens.sort(sortTokens);

    expect(tokens).toMatchObject(sortedTokens);
  });
  test("sorts 0 length blocks test 3", () => {
    let tokens: SortableToken[] = [
      {
        index: 0,
        type: TokenType.BLOCK_END,
        annotation: { id: "1", start: 0, end: 0, rank: 5, type: "div" },
      },
      {
        index: 0,
        type: TokenType.BLOCK_START,
        annotation: { id: "2", start: 0, end: 100, rank: 5, type: "div" },
      },
      {
        index: 0,
        type: TokenType.BLOCK_START,
        annotation: { id: "1", start: 0, end: 0, rank: 5, type: "div" },
      },
    ];

    let sortedTokens: SortableToken[] = [
      {
        index: 0,
        type: TokenType.BLOCK_START,
        annotation: { id: "1", start: 0, end: 0, rank: 5, type: "div" },
      },
      {
        index: 0,
        type: TokenType.BLOCK_END,
        annotation: { id: "1", start: 0, end: 0, rank: 5, type: "div" },
      },
      {
        index: 0,
        type: TokenType.BLOCK_START,
        annotation: { id: "2", start: 0, end: 100, rank: 5, type: "div" },
      },
    ];

    tokens.sort(sortTokens);

    expect(tokens).toMatchObject(sortedTokens);
  });
});

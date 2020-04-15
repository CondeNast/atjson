/* eslint-disable no-control-regex */
import { ParseAnnotation, UnknownAnnotation } from "../src";
import TestSource, { Bold, CaptionSource, Image, Italic } from "./test-source";

describe("new Document", () => {
  test("constructor accepts an object", () => {
    expect(
      new TestSource({
        content: "Hello World.",
        annotations: [],
      })
    ).toBeDefined();
  });

  test("constructor will set annotations", () => {
    expect(
      new TestSource({
        content: "Hello World.",
        annotations: [
          new Bold({
            start: 0,
            end: 2,
            attributes: {},
          }),
        ],
      })
    ).toBeDefined();
  });

  test("instantiating with Annotations", () => {
    let doc = new TestSource({
      content: "Hello World.",
      annotations: [
        new Bold({
          start: 0,
          end: 2,
        }),
      ],
    });

    expect(doc.where((a) => a instanceof Bold).length).toBe(1);
  });

  test("instantiating with UnknownAnnotations", () => {
    let doc = new TestSource({
      content: "Hello World.",
      annotations: [
        new UnknownAnnotation({
          start: 0,
          end: 2,
          attributes: {
            type: "-test-bold",
            attributes: {},
          },
        }),
      ],
    });

    expect(doc.where((a) => a instanceof Bold).length).toBe(1);
  });

  test("instantiating with JSON", () => {
    let doc = new TestSource({
      content: "Hello World.",
      annotations: [
        {
          type: "-test-bold",
          start: 0,
          end: 2,
          attributes: {},
        },
      ],
    });

    expect(doc.where((a) => a instanceof Bold).length).toBe(1);
  });

  test("clone", () => {
    let document = new TestSource({
      content: "Hello World.",
      annotations: [
        new Bold({
          start: 0,
          end: 2,
          attributes: {},
        }),
      ],
    });
    let clone = document.clone();
    let [bold] = document.annotations;
    let [cloneBold] = clone.annotations;

    expect(clone).toBeInstanceOf(TestSource);
    expect(document.content).toEqual(clone.content);
    expect(bold).not.toBe(cloneBold);
    expect(bold).toBeInstanceOf(Bold);
    expect(cloneBold).toBeInstanceOf(Bold);
    expect(document.toJSON()).toEqual(clone.toJSON());
  });

  test("nested documents", () => {
    let document = new TestSource({
      content: "\uFFFC",
      annotations: [
        {
          id: "1",
          type: "-test-image",
          start: 0,
          end: 1,
          attributes: {
            "-test-url": "http://www.example.com/test.jpg",
            "-test-caption": {
              content: "An example caption",
              annotations: [
                {
                  type: "-test-italic",
                  start: 3,
                  end: 10,
                  attributes: {},
                },
              ],
            },
          },
        },
      ],
    });

    let image = document.annotations[0] as Image;
    let [italic] = image.attributes.caption.annotations;

    expect(document.content).toEqual("\uFFFC");
    expect(image.attributes.caption).toBeInstanceOf(CaptionSource);
    expect(italic).toBeInstanceOf(Italic);
    expect(image.attributes.caption.content).toEqual("An example caption");
  });

  describe("match", () => {
    let document = new TestSource({
      content:
        "Kublai Khan does not necessarily believe everything Marco \
        Polo says when he describes the cities visited on his expeditions, but the emperor of the Tartars does continue listening \
        to the young Venetian with greater attention and curiosity \
        than he shows any other messenger or explorer of his. In the \
        lives of emperors there is a moment which follows pride in \
        the boundiess extension of the territories we have conquered, \
        and the melancholy and relief of knowing we shall soon \
        give up any thought of knowing and understanding them.\
        \u000B\u000B\
        There is a sense of emptiness that comes over us at evening, \
        with the odor of the elephants after the rain and the sandalwood \
        ashes growing cold in the braziers, a dizziness that \
        makes rivers and mountains tremble on the fallow curves of \
        the planispheres where they are portrayed, and rolls up, one \
        after the other, the despatches announcing to us the collapse \
        of the last enemy troops, from defeat to defeat, and flakes \
        the wax of the seals of obscure kings who beseech our \
        armies' protection, offering in exchange annual tributes of \
        precious metals, tanned hides, anti tortoise shell.\
        \u220E",
      annotations: [],
    });

    const MATCHES_AND = [
      [241, 244],
      [469, 472],
      [488, 491],
      [563, 566],
      [574, 577],
      [719, 722],
      [728, 731],
      [820, 823],
      [917, 920],
      [1062, 1065],
    ].map(([start, end]) => {
      return {
        start,
        end,
        matches: ["and"],
      };
    });

    test("non-global regex returns first match", () => {
      expect(document.match(/and/)).toEqual(MATCHES_AND.slice(0, 1));
    });

    test("global regex returns all matches", () => {
      expect(document.match(/and/g)).toEqual(MATCHES_AND);
    });

    test("match groups are returned", () => {
      expect(document.match(/(a)(nd)+/g)).toEqual(
        MATCHES_AND.map(({ start, end }) => {
          return {
            start,
            end,
            matches: ["and", "a", "nd"],
          };
        })
      );
    });

    test("regex can contain unicode characters", () => {
      expect(document.match(/[\u000B\u220E]/g)).toEqual([
        { start: 594, end: 595, matches: ["\u000B"] },
        { start: 595, end: 596, matches: ["\u000B"] },
        { start: 1270, end: 1271, matches: ["\u220E"] },
      ]);
    });

    test("match finds within ranges", () => {
      expect(document.match(/and/g, 0, 500)).toEqual(MATCHES_AND.slice(0, 3));
      expect(document.match(/and/g, 500)).toEqual(MATCHES_AND.slice(3));
      expect(document.match(/and/g, 500, 505)).toEqual([]);
      expect(document.match(/and/g, 500, 800)).toEqual(MATCHES_AND.slice(3, 7));
    });
  });

  describe("slice", () => {
    let document = new TestSource({
      content: "Hello, world!\n\uFFFC",
      annotations: [
        {
          id: "1",
          type: "-test-bold",
          start: 0,
          end: 5,
          attributes: {},
        },
        {
          id: "2",
          type: "-test-italic",
          start: 0,
          end: 13,
          attributes: {},
        },
        {
          id: "3",
          type: "-test-underline",
          start: 0,
          end: 13,
          attributes: {},
        },
        {
          id: "4",
          type: "-test-instagram",
          start: 14,
          end: 15,
          attributes: {
            "-test-uri": "https://www.instagram.com/p/BeW0pqZDUuK/",
          },
        },
      ],
    });

    test("slice matching boundary", () => {
      let doc = document.slice(0, 5);

      expect(doc.toJSON()).toEqual({
        content: "Hello",
        contentType: "application/vnd.atjson+test",
        schema: [
          "-test-a",
          "-test-bold",
          "-test-code",
          "-test-image",
          "-test-instagram",
          "-test-italic",
          "-test-locale",
          "-test-manual",
          "-test-paragraph",
          "-test-pre",
        ],
        annotations: [
          {
            id: "1",
            type: "-test-bold",
            start: 0,
            end: 5,
            attributes: {},
          },
          {
            id: "2",
            type: "-test-italic",
            start: 0,
            end: 5,
            attributes: {},
          },
          {
            id: "3",
            type: "-test-underline",
            start: 0,
            end: 5,
            attributes: {},
          },
        ],
      });
    });

    test("slice with parse annotations", () => {
      let document = new TestSource({
        content: "<em>Hello, <b>world</b>!</em>",
        annotations: [
          new ParseAnnotation({ start: 0, end: 4 }),
          new Italic({ start: 0, end: 29 }),
          new Bold({ start: 11, end: 23 }),
          new ParseAnnotation({ start: 11, end: 14 }),
          new ParseAnnotation({ start: 19, end: 23 }),
          new ParseAnnotation({ start: 24, end: 29 }),
        ],
      });
      let doc = document.slice(4, 24);

      expect(doc.toJSON()).toMatchObject({
        content: "Hello, <b>world</b>!",
        annotations: [
          {
            type: "-test-italic",
            start: 0,
            end: 20,
          },
          {
            type: "-test-bold",
            start: 7,
            end: 19,
          },
          {
            type: "-atjson-parse-token",
            start: 7,
            end: 10,
          },
          {
            type: "-atjson-parse-token",
            start: 15,
            end: 19,
          },
        ],
      });
    });

    test("source documents are unaltered", () => {
      let doc = document.slice(7, 12);

      expect(doc.toJSON()).toMatchObject({
        content: "world",
        contentType: "application/vnd.atjson+test",
        annotations: [
          {
            id: "2",
            type: "-test-italic",
            start: 0,
            end: 5,
            attributes: {},
          },
          {
            id: "3",
            type: "-test-underline",
            start: 0,
            end: 5,
            attributes: {},
          },
        ],
      });

      expect(document.toJSON()).toMatchObject({
        content: "Hello, world!\n\uFFFC",
        contentType: "application/vnd.atjson+test",
        annotations: [
          {
            id: "2",
            type: "-test-italic",
            start: 0,
            end: 13,
            attributes: {},
          },
          {
            id: "3",
            type: "-test-underline",
            start: 0,
            end: 13,
            attributes: {},
          },
          {
            id: "1",
            type: "-test-bold",
            start: 0,
            end: 5,
            attributes: {},
          },
          {
            id: "4",
            type: "-test-instagram",
            start: 14,
            end: 15,
            attributes: {
              "-test-uri": "https://www.instagram.com/p/BeW0pqZDUuK/",
            },
          },
        ],
      });
    });
  });

  describe("cut", () => {
    test("cut matching boundary", () => {
      let document = new TestSource({
        content: "Hello, world!\n\uFFFC",
        annotations: [
          {
            id: "1",
            type: "-test-bold",
            start: 0,
            end: 5,
            attributes: {},
          },
          {
            id: "2",
            type: "-test-italic",
            start: 0,
            end: 13,
            attributes: {},
          },
          {
            id: "3",
            type: "-test-underline",
            start: 0,
            end: 13,
            attributes: {},
          },
          {
            id: "4",
            type: "-test-instagram",
            start: 14,
            end: 15,
            attributes: {
              "-test-uri": "https://www.instagram.com/p/BeW0pqZDUuK/",
            },
          },
        ],
      });

      let cut = document.cut(0, 5);

      expect(cut.toJSON()).toMatchObject({
        content: "Hello",
        contentType: "application/vnd.atjson+test",
        annotations: [
          {
            id: "1",
            type: "-test-bold",
            start: 0,
            end: 5,
            attributes: {},
          },
          {
            id: "2",
            type: "-test-italic",
            start: 0,
            end: 5,
            attributes: {},
          },
          {
            id: "3",
            type: "-test-underline",
            start: 0,
            end: 5,
            attributes: {},
          },
        ],
      });

      expect(document.toJSON()).toMatchObject({
        content: ", world!\n\uFFFC",
        annotations: [
          {
            id: "2",
            type: "-test-italic",
            start: 0,
            end: 8,
            attributes: {},
          },
          {
            id: "3",
            type: "-test-underline",
            start: 0,
            end: 8,
            attributes: {},
          },
          {
            id: "4",
            type: "-test-instagram",
            start: 9,
            end: 10,
            attributes: {
              "-test-uri": "https://www.instagram.com/p/BeW0pqZDUuK/",
            },
          },
        ],
      });
    });

    test("cut with parse annotations", () => {
      let document = new TestSource({
        content: "<em>Hello, <b>world</b>!</em>",
        annotations: [
          new ParseAnnotation({ start: 0, end: 4 }),
          new Italic({ start: 0, end: 29 }),
          new Bold({ start: 11, end: 23 }),
          new ParseAnnotation({ start: 11, end: 14 }),
          new ParseAnnotation({ start: 19, end: 23 }),
          new ParseAnnotation({ start: 24, end: 29 }),
        ],
      });
      let cut = document.cut(11, 23);

      expect(cut.toJSON()).toMatchObject({
        content: "<b>world</b>",
        contentType: "application/vnd.atjson+test",
        annotations: [
          {
            type: "-test-bold",
            start: 0,
            end: 12,
            attributes: {},
          },
          {
            type: "-test-italic",
            start: 0,
            end: 12,
            attributes: {},
          },
          {
            type: "-atjson-parse-token",
            start: 0,
            end: 3,
            attributes: {},
          },
          {
            type: "-atjson-parse-token",
            start: 8,
            end: 12,
            attributes: {},
          },
        ],
      });

      expect(document.toJSON()).toMatchObject({
        content: "<em>Hello, !</em>",
        annotations: [
          {
            attributes: {},
            end: 17,
            start: 0,
            type: "-test-italic",
          },
          {
            attributes: {},
            end: 4,
            start: 0,
            type: "-atjson-parse-token",
          },
          {
            attributes: {},
            end: 17,
            start: 12,
            type: "-atjson-parse-token",
          },
        ],
      });
    });
  });
});

import { ParseAnnotation, SliceAnnotation } from "@atjson/document";
import TestSource, { Bold, Italic, Paragraph, Quote } from "./test-source";

jest.unmock("uuid-random");

import uuid from "uuid-random";

describe("Document#equals", () => {
  test("documents are correctly compared for equality", () => {
    let leftHandSideTestDoc = new TestSource({
      content: "<b>Hello</b>,\n World!",
      annotations: [
        new ParseAnnotation({ start: 0, end: 3 }),
        new ParseAnnotation({ start: 8, end: 12 }),
        new Paragraph({ start: 0, end: 13 }),
        new Bold({ start: 0, end: 12 }),
      ],
    });

    let rightHandSideTestDoc = new TestSource({
      content: "<b>Hello</b>,\n <blink>World!</blink>",
      annotations: [
        new ParseAnnotation({ start: 15, end: 22 }),
        new ParseAnnotation({ start: 28, end: 36 }),
        new ParseAnnotation({ start: 0, end: 3 }),
        new ParseAnnotation({ start: 8, end: 12 }),
        new Paragraph({ start: 0, end: 13 }),
        new Bold({ start: 0, end: 12 }),
      ],
    });

    let unequalRightHandSideTestDoc = new TestSource({
      content: "<b>Hello</b>,\n <blink>World!</blink>",
      annotations: [
        new ParseAnnotation({ start: 15, end: 22 }),
        new ParseAnnotation({ start: 28, end: 36 }),
        new ParseAnnotation({ start: 0, end: 3 }),
        new ParseAnnotation({ start: 8, end: 12 }),
        new Paragraph({ start: 0, end: 13 }),
      ],
    });

    expect(leftHandSideTestDoc.equals(rightHandSideTestDoc)).toBe(true);
    expect(leftHandSideTestDoc.equals(unequalRightHandSideTestDoc)).toBe(false);
  });

  test("annotation attributes are correctly compared for equality", () => {
    let leftHandSideTestDoc = new TestSource({
      content: "\uFFFC",
      annotations: [
        {
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

    let rightHandSideTestDoc = new TestSource({
      content: "\uFFFC",
      annotations: [
        {
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

    let unequalRightHandSideTestDoc = new TestSource({
      content: "\uFFFC",
      annotations: [
        {
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
                  start: 4,
                  end: 10,
                  attributes: {},
                },
              ],
            },
          },
        },
      ],
    });

    expect(leftHandSideTestDoc.equals(rightHandSideTestDoc)).toBe(true);
    expect(leftHandSideTestDoc.equals(unequalRightHandSideTestDoc)).toBe(false);
  });

  test("HTML documents and MD documents are correctly compared for equality", () => {
    let MDTestDoc = new TestSource({
      content: "Hello, **world**",
      annotations: [
        new ParseAnnotation({ start: 14, end: 16 }),
        new ParseAnnotation({ start: 7, end: 9 }),
        new Bold({ start: 7, end: 16 }),
      ],
    });

    let HTMLTestDoc = new TestSource({
      content: "Hello, <b>world</b>",
      annotations: [
        new ParseAnnotation({ start: 7, end: 10 }),
        new ParseAnnotation({ start: 15, end: 19 }),
        new Bold({ start: 7, end: 19 }),
      ],
    });
    expect(MDTestDoc.equals(HTMLTestDoc)).toBe(true);
  });

  describe("slices", () => {
    test("HTML documents and MD documents are correctly compared for equality", () => {
      let quoteId = uuid();
      let creditId = uuid();
      let citationId = uuid();

      let htmlQuoteId = uuid();
      let htmlCreditId = uuid();
      let htmlCitationId = uuid();

      let PlainTextTestDoc = new TestSource({
        content:
          `If any of you in any way hate homosexuals, people of different color, or women, please do this one favor for us—leave us the fuck alone! Don’t come to our shows and don’t buy our records.\n` +
          `  —Kurt Cobain\n` +
          `  “Incesticide” liner notes, 1992.`,
        annotations: [
          new Quote({
            id: quoteId,
            start: 0,
            end: 187,
            attributes: {
              credit: creditId,
              citation: citationId,
            },
          }),
          new ParseAnnotation({ start: 187, end: 190 }),
          new Italic({ start: 190, end: 202 }),
          new SliceAnnotation({
            id: creditId,
            start: 190,
            end: 202,
            attributes: { refs: [quoteId] },
          }),
          new ParseAnnotation({ start: 202, end: 205 }),
          new SliceAnnotation({
            id: citationId,
            start: 205,
            end: 237,
            attributes: { refs: [quoteId] },
          }),
        ],
      });

      let HTMLTestDoc = new TestSource({
        content:
          "<figure><blockquote>If any of you in any way hate homosexuals, people of different color, or women, please do this one favor for us—leave us the fuck alone! Don’t come to our shows and don’t buy our records.</blockquote><figcaption><em>—Kurt Cobain</em><cite>“Incesticide” liner notes, 1992.</cite></figcaption></figure>",
        annotations: [
          new ParseAnnotation({ start: 0, end: 8 }),
          new ParseAnnotation({ start: 8, end: 20 }),
          new Quote({
            id: htmlQuoteId,
            start: 20,
            end: 220,
            attributes: {
              credit: htmlCreditId,
              citation: htmlCitationId,
            },
          }),
          new ParseAnnotation({ start: 207, end: 220 }),
          new ParseAnnotation({ start: 220, end: 232 }),
          new ParseAnnotation({ start: 232, end: 236 }),
          new ParseAnnotation({ start: 248, end: 253 }),
          new Italic({ start: 232, end: 253 }),
          new SliceAnnotation({
            id: htmlCreditId,
            start: 232,
            end: 253,
            attributes: { refs: [htmlQuoteId] },
          }),
          new ParseAnnotation({ start: 253, end: 259 }),
          new ParseAnnotation({ start: 291, end: 298 }),
          new SliceAnnotation({
            id: htmlCitationId,
            start: 253,
            end: 298,
            attributes: { refs: [htmlQuoteId] },
          }),
          new ParseAnnotation({ start: 298, end: 311 }),
          new ParseAnnotation({ start: 311, end: 320 }),
        ],
      });
      expect(PlainTextTestDoc.equals(HTMLTestDoc)).toBe(true);
    });
  });
});

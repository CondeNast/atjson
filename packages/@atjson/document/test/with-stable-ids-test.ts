import { ParseAnnotation, SliceAnnotation } from "@atjson/document";
import TestSource, { Bold, Italic, Paragraph, Quote } from "./test-source";

jest.unmock("uuid-random");

import uuid from "uuid-random";

describe("Document#withStableId", () => {
  test("ids are stable", () => {
    let doc = new TestSource({
      content: "<b>Hello</b>,\n World!",
      annotations: [
        new ParseAnnotation({ start: 0, end: 3 }),
        new ParseAnnotation({ start: 8, end: 12 }),
        new Paragraph({ start: 0, end: 13 }),
        new Bold({ start: 0, end: 12 }),
      ],
    }).withStableIds();

    expect(doc.toJSON()).toMatchSnapshot();
  });

  test("annotations are ordered and have consistent ids", () => {
    let doc = new TestSource({
      content: "<b>Hello</b>,\n World!",
      annotations: [
        new ParseAnnotation({ start: 8, end: 12 }),
        new Bold({ start: 0, end: 12 }),
        new Paragraph({ start: 0, end: 13 }),
        new ParseAnnotation({ start: 0, end: 3 }),
      ].sort(() => Math.round(Math.random() * 2) - 1),
    }).withStableIds();

    expect(doc.toJSON()).toMatchSnapshot();
  });

  test("annotations by id reference are equal (even when the ids are different)", () => {
    let quoteId = uuid();
    let creditId = uuid();
    let citationId = uuid();

    let doc = new TestSource({
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
    }).withStableIds();

    expect(doc.toJSON()).toMatchSnapshot();
  });
});

import Document from "../src";
import { Anchor, Bold, CaptionSchema, Image, Italic } from "./test-source";

describe("Annotation", () => {
  describe("clone", () => {
    test("undefined attributes", () => {
      let link = new Anchor({
        start: 0,
        end: 1,
        attributes: {
          href: "https://www.example.com",
          target: undefined
        }
      });

      expect(link.equals(link.clone())).toBe(true);
    });

    test("null attributes", () => {
      let link = new Anchor({
        start: 0,
        end: 1,
        attributes: {
          href: "https://www.example.com",
          target: null
        }
      });

      expect(link.equals(link.clone())).toBe(true);
    });
  });

  describe("equals", () => {
    test("annotations are properly compared for equality", () => {
      expect(
        new Bold({ start: 0, end: 5 }).equals(new Bold({ start: 0, end: 5 }))
      ).toBeTruthy();
    });

    test("subdocuments", () => {
      let image = new Image({
        start: 0,
        end: 1,
        attributes: {
          url: "http://www.example.com/test.jpg",
          caption: new Document({
            content: "An example caption",
            annotations: [new Italic({ start: 3, end: 10 })],
            schema: CaptionSchema
          })
        }
      });

      expect(image.equals(image.clone())).toBeTruthy();

      let other = new Image({
        start: 0,
        end: 1,
        attributes: {
          url: "http://www.example.com/test.jpg",
          caption: new Document({
            content: "An example caption",
            annotations: [new Italic({ start: 4, end: 10 })],
            schema: CaptionSchema
          })
        }
      });

      expect(image.equals(other)).toBeFalsy();
    });
  });
});

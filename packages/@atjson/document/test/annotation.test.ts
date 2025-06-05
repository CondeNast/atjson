import { is } from "@atjson/document";
import TestSource, { Anchor, Bold } from "./test-source";

describe("Annotation", () => {
  describe("is", () => {
    test("the same annotation", () => {
      let bold = new Bold({ start: 0, end: 0 });
      expect(is(bold, Bold)).toBeTruthy();
    });

    test("null annotations", () => {
      expect(is(null, Bold)).toBeFalsy();
    });

    test("is not the same annotation", () => {
      let bold = new Bold({ start: 0, end: 0 });
      expect(is(bold, Anchor)).toBeFalsy();
    });
  });

  describe("equals", () => {
    test("annotations are properly compared for equality", () => {
      let lhsAnnotation = new Bold({ start: 0, end: 5 });
      let rhsAnnotation = new Bold({ start: 0, end: 5 });

      expect(lhsAnnotation.equals(rhsAnnotation)).toBe(true);
    });
    test("annotations should return false when the attributes are not strictly equal", () => {
      let lhsAnnotation = new Bold({ start: 0, end: 5 });
      let rhsAnnotation = new Bold({ start: 0, end: 5, attributes: { a: 2 } });

      expect(lhsAnnotation.equals(rhsAnnotation)).toBe(false);
    });
  });

  describe("clone", () => {
    test("undefined attributes", () => {
      let link = new Anchor({
        start: 0,
        end: 1,
        attributes: {
          href: "https://www.example.com",
          target: undefined,
        },
      });

      expect(link.equals(link.clone())).toBe(true);
    });

    test("null attributes", () => {
      let link = new Anchor({
        start: 0,
        end: 1,
        attributes: {
          href: "https://www.example.com",
          target: null,
        },
      });

      expect(link.equals(link.clone())).toBe(true);
    });
  });
});

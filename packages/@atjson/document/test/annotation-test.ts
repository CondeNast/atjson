import TestSource, { Anchor, Bold } from "./test-source";

describe("Annotation", () => {
  describe("equals", () => {
    test("annotations are properly compared for equality", () => {
      let lhsAnnotation = new Bold({ start: 0, end: 5 });
      let rhsAnnotation = new Bold({ start: 0, end: 5 });

      expect(lhsAnnotation.equals(rhsAnnotation)).toBe(true);
    });
    test("annotations are compared recursively", () => {
      let leftHandSideTestDoc = new TestSource({
        content: "\uFFFC",
        annotations: [
          {
            id: "1",
            type: "-test-image",
            start: 0,
            end: 1,
            attributes: {
              url: "http://www.example.com/test.jpg",
              caption: {
                content: "An example caption",
                annotations: [
                  {
                    type: "-test-italic",
                    start: 3,
                    end: 10,
                    attributes: {}
                  }
                ]
              }
            }
          }
        ]
      });

      let rightHandSideTestDoc = new TestSource({
        content: "\uFFFC",
        annotations: [
          {
            id: "1",
            type: "-test-image",
            start: 0,
            end: 1,
            attributes: {
              url: "http://www.example.com/test.jpg",
              caption: {
                content: "An example caption",
                annotations: [
                  {
                    type: "-test-italic",
                    start: 3,
                    end: 10,
                    attributes: {}
                  }
                ]
              }
            }
          }
        ]
      });

      let unequalRightHandSideTestDoc = new TestSource({
        content: "\uFFFC",
        annotations: [
          {
            id: "1",
            type: "-test-image",
            start: 0,
            end: 1,
            attributes: {
              url: "http://www.example.com/test.jpg",
              caption: {
                content: "An example caption",
                annotations: [
                  {
                    type: "-test-italic",
                    start: 4,
                    end: 10,
                    attributes: {}
                  }
                ]
              }
            }
          }
        ]
      });

      expect(
        leftHandSideTestDoc.annotations[0].equals(
          rightHandSideTestDoc.annotations[0]
        )
      ).toBe(true);
      expect(
        leftHandSideTestDoc.annotations[0].equals(
          unequalRightHandSideTestDoc.annotations[0]
        )
      ).toBe(false);
    });
  });

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
});

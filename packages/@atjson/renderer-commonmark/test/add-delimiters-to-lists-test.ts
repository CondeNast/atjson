import { addDelimitersToLists } from "../src/lib/add-delimiters-to-lists";
import * as Tokens from "../src/lib/tokens";

describe("addDelimitersToLists", () => {
  describe("numbered lists", () => {
    test("a single list", () => {
      let stream = [
        Tokens.NumberedListStart(1),
        Tokens.ListItemStart(""),
        "one fish",
        Tokens.ListItemEnd,
        Tokens.ListItemStart(""),
        "two fish",
        Tokens.ListItemEnd,
        Tokens.ListItemStart(""),
        "red fish",
        Tokens.ListItemEnd,
        Tokens.ListItemStart(""),
        "blue fish",
        Tokens.ListItemEnd,
        Tokens.NumberedListEnd
      ];

      expect(addDelimitersToLists(stream)).toEqual([
        Tokens.NumberedListStart(1),
        Tokens.ListItemStart("1. "),
        "one fish",
        Tokens.ListItemEnd,
        Tokens.ListItemStart("2. "),
        "two fish",
        Tokens.ListItemEnd,
        Tokens.ListItemStart("3. "),
        "red fish",
        Tokens.ListItemEnd,
        Tokens.ListItemStart("4. "),
        "blue fish",
        Tokens.ListItemEnd,
        Tokens.NumberedListEnd
      ]);
    });

    test("multiple adjacent lists", () => {
      let stream = [
        Tokens.NumberedListStart(1),
        Tokens.ListItemStart(""),
        "one fish",
        Tokens.ListItemEnd,
        Tokens.NumberedListEnd,
        Tokens.NumberedListStart(2),
        Tokens.ListItemStart(""),
        "two fish",
        Tokens.ListItemEnd,
        Tokens.NumberedListEnd,
        Tokens.NumberedListStart(3),
        Tokens.ListItemStart(""),
        "red fish",
        Tokens.ListItemEnd,
        Tokens.NumberedListEnd,
        Tokens.NumberedListStart(5),
        Tokens.ListItemStart(""),
        "blue fish",
        Tokens.ListItemEnd,
        Tokens.NumberedListEnd
      ];

      expect(addDelimitersToLists(stream)).toEqual([
        Tokens.NumberedListStart(1),
        Tokens.ListItemStart("1. "),
        "one fish",
        Tokens.ListItemEnd,
        Tokens.NumberedListEnd,
        Tokens.NumberedListStart(2),
        Tokens.ListItemStart("2) "),
        "two fish",
        Tokens.ListItemEnd,
        Tokens.NumberedListEnd,
        Tokens.NumberedListStart(3),
        Tokens.ListItemStart("3. "),
        "red fish",
        Tokens.ListItemEnd,
        Tokens.NumberedListEnd,
        Tokens.NumberedListStart(5),
        Tokens.ListItemStart("5) "),
        "blue fish",
        Tokens.ListItemEnd,
        Tokens.NumberedListEnd
      ]);
    });

    test("non-adjacent lists use the default markers", () => {
      let stream = [
        Tokens.NumberedListStart(1),
        Tokens.ListItemStart(""),
        "one fish",
        Tokens.ListItemEnd,
        Tokens.ListItemStart(""),
        "two fish",
        Tokens.ListItemEnd,
        Tokens.NumberedListEnd,
        "red fish",
        Tokens.NumberedListStart(3),
        Tokens.ListItemStart(""),
        "blue fish",
        Tokens.ListItemEnd,
        Tokens.NumberedListEnd
      ];

      expect(addDelimitersToLists(stream)).toEqual([
        Tokens.NumberedListStart(1),
        Tokens.ListItemStart("1. "),
        "one fish",
        Tokens.ListItemEnd,
        Tokens.ListItemStart("2. "),
        "two fish",
        Tokens.ListItemEnd,
        Tokens.NumberedListEnd,
        "red fish",
        Tokens.NumberedListStart(3),
        Tokens.ListItemStart("3. "),
        "blue fish",
        Tokens.ListItemEnd,
        Tokens.NumberedListEnd
      ]);
    });
  });

  describe("bulleted lists", () => {
    test("a single list", () => {
      let stream = [
        Tokens.BulletedListStart,
        Tokens.ListItemStart(""),
        "one fish",
        Tokens.ListItemEnd,
        Tokens.ListItemStart(""),
        "two fish",
        Tokens.ListItemEnd,
        Tokens.ListItemStart(""),
        "red fish",
        Tokens.ListItemEnd,
        Tokens.ListItemStart(""),
        "blue fish",
        Tokens.ListItemEnd,
        Tokens.BulletedListEnd
      ];

      expect(addDelimitersToLists(stream)).toEqual([
        Tokens.BulletedListStart,
        Tokens.ListItemStart("- "),
        "one fish",
        Tokens.ListItemEnd,
        Tokens.ListItemStart("- "),
        "two fish",
        Tokens.ListItemEnd,
        Tokens.ListItemStart("- "),
        "red fish",
        Tokens.ListItemEnd,
        Tokens.ListItemStart("- "),
        "blue fish",
        Tokens.ListItemEnd,
        Tokens.BulletedListEnd
      ]);
    });

    test("multiple adjacent lists", () => {
      let stream = [
        Tokens.BulletedListStart,
        Tokens.ListItemStart(""),
        "one fish",
        Tokens.ListItemEnd,
        Tokens.BulletedListEnd,
        Tokens.BulletedListStart,
        Tokens.ListItemStart(""),
        "two fish",
        Tokens.ListItemEnd,
        Tokens.ListItemStart(""),
        "red fish",
        Tokens.ListItemEnd,
        Tokens.BulletedListEnd,
        Tokens.BulletedListStart,
        Tokens.ListItemStart(""),
        "blue fish",
        Tokens.ListItemEnd,
        Tokens.BulletedListEnd
      ];

      expect(addDelimitersToLists(stream)).toEqual([
        Tokens.BulletedListStart,
        Tokens.ListItemStart("- "),
        "one fish",
        Tokens.ListItemEnd,
        Tokens.BulletedListEnd,
        Tokens.BulletedListStart,
        Tokens.ListItemStart("* "),
        "two fish",
        Tokens.ListItemEnd,
        Tokens.ListItemStart("* "),
        "red fish",
        Tokens.ListItemEnd,
        Tokens.BulletedListEnd,
        Tokens.BulletedListStart,
        Tokens.ListItemStart("- "),
        "blue fish",
        Tokens.ListItemEnd,
        Tokens.BulletedListEnd
      ]);
    });

    test("non-adjacent lists use the default markers", () => {
      let stream = [
        Tokens.BulletedListStart,
        Tokens.ListItemStart(""),
        "one fish",
        Tokens.ListItemEnd,
        Tokens.BulletedListEnd,
        "two fish",
        "red fish",
        Tokens.BulletedListStart,
        Tokens.ListItemStart(""),
        "blue fish",
        Tokens.ListItemEnd,
        Tokens.BulletedListEnd
      ];

      expect(addDelimitersToLists(stream)).toEqual([
        Tokens.BulletedListStart,
        Tokens.ListItemStart("- "),
        "one fish",
        Tokens.ListItemEnd,
        Tokens.BulletedListEnd,
        "two fish",
        "red fish",
        Tokens.BulletedListStart,
        Tokens.ListItemStart("- "),
        "blue fish",
        Tokens.ListItemEnd,
        Tokens.BulletedListEnd
      ]);
    });

    test("thematic breaks inside of lists", () => {
      let stream = [
        Tokens.BulletedListStart,
        Tokens.ListItemStart(""),
        "one fish",
        Tokens.ListItemEnd,
        Tokens.BulletedListEnd,
        Tokens.BulletedListStart,
        Tokens.ListItemStart(""),
        Tokens.ThematicBreak("*"),
        Tokens.ListItemEnd,
        Tokens.BulletedListEnd
      ];

      expect(addDelimitersToLists(stream)).toEqual([
        Tokens.BulletedListStart,
        Tokens.ListItemStart("- "),
        "one fish",
        Tokens.ListItemEnd,
        Tokens.BulletedListEnd,
        Tokens.BulletedListStart,
        Tokens.ListItemStart("* "),
        Tokens.ThematicBreak("-"),
        Tokens.ListItemEnd,
        Tokens.BulletedListEnd
      ]);
    });
  });
});

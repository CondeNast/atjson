import {
  fixDelimiterRuns,
  flattenStreams,
  mergeStrings,
  splitLines,
  streamIncludes,
  hasLeadingWhitespace,
  hasTrailingWhitespace,
  flatMapStringReplace,
  streamFlatMapStringReplace,
  greedilyTakeLeadingWhiteSpace,
  greedilyTakeTrailingWhiteSpace
} from "../src";

import * as T from "../src/lib/tokens";

describe("commonmark renderer utility functions", () => {
  describe("fixDelimiterRuns", () => {
    test("fixing left delimiter runs basically works", () => {
      let stream = [
        "some leading text",
        T.STRONG_STAR_START(),
        ". some bold text"
      ];

      expect(fixDelimiterRuns(stream)).toEqual([
        "some leading text",
        ".",
        " ",
        T.STRONG_STAR_START(),
        "some bold text"
      ]);
    });

    test("fixing right delimiter runs basically works", () => {
      let stream = ["bold text -", T.STRONG_STAR_END(), "some other stuff"];

      expect(fixDelimiterRuns(stream)).toEqual([
        "bold text",
        T.STRONG_STAR_END(),
        " ",
        "-",
        "some other stuff"
      ]);
    });

    test("fixing deeply nested stuff", () => {
      // foo******bar*********baz
      let stream = [
        "foo",
        T.STRONG_STAR_START(),
        T.STRONG_STAR_START(),
        T.STRONG_STAR_START(),
        "bar",
        T.STRONG_STAR_END(),
        T.STRONG_STAR_END(),
        T.STRONG_STAR_END(),
        "\\*\\*\\*baz",
        T.BLOCK_SEPARATOR()
      ];

      expect(fixDelimiterRuns(stream)).toEqual(stream);
    });
  });

  describe("flatMapStringReplace", () => {
    test("escaping list delimiters", () => {
      let string = "1. list item\n2. list item";

      expect(
        flatMapStringReplace(string, /([0-9]+)\.([^\n]+)/, ([, $1, $2]) => {
          return [$1, T.ESCAPED_PUNCTUATION("."), $2];
        })
      ).toEqual([
        "1",
        T.ESCAPED_PUNCTUATION("."),
        " list item",
        "\n",
        "2",
        T.ESCAPED_PUNCTUATION("."),
        " list item"
      ]);
    });
  });

  test("streamFlatMapStringReplace", () => {
    let stream = [
      "test test",
      T.SOFT_LINE_BREAK(),
      T.STRONG_STAR_START(),
      "test",
      T.STRONG_STAR_END()
    ];

    expect(
      streamFlatMapStringReplace(stream, /t(.)st/, ([, $1]) => {
        return [$1.repeat(5)];
      })
    ).toEqual([
      "eeeee",
      " ",
      "eeeee",
      T.SOFT_LINE_BREAK(),
      T.STRONG_STAR_START(),
      "eeeee",
      T.STRONG_STAR_END()
    ]);
  });

  test("flattenStreams", () => {
    let streams = [
      [],
      [T.SOFT_LINE_BREAK()],
      [T.STRONG_STAR_START(), "hello world", T.STRONG_STAR_END()]
    ];

    expect(flattenStreams(streams)).toEqual([
      T.SOFT_LINE_BREAK(),
      T.STRONG_STAR_START(),
      "hello world",
      T.STRONG_STAR_END()
    ]);
  });

  test("mergeStrings", () => {
    let stream = ["\n", "\n", T.THEMATIC_BREAK(), "testing", "1\n2"];

    expect(mergeStrings(stream)).toEqual([
      "\n\n",
      T.THEMATIC_BREAK(),
      "testing1\n2"
    ]);
  });

  test("splitLines", () => {
    let stream = ["test\nstream", T.THEMATIC_BREAK(), "\nhello\nworld"];

    expect(splitLines(stream)).toEqual([
      ["test"],
      ["stream", T.THEMATIC_BREAK(), ""],
      ["hello"],
      ["world"]
    ]);
  });

  test("streamIncludes", () => {
    let stream = ["test\n", T.ATX_HEADING(2), "this is a heading"];

    expect(streamIncludes(stream, "heading")).toBe(true);

    expect(streamIncludes(stream, T.ATX_HEADING(2))).toBe(true);

    expect(streamIncludes(stream, "test\nthis")).toBe(false);
  });

  test("hasLeadingWhitespace", () => {
    expect(hasLeadingWhitespace(" a string")).toBe(true);
    expect(hasLeadingWhitespace("another string ")).toBe(false);
    expect(hasLeadingWhitespace(T.SOFT_LINE_BREAK())).toBe(true);
    expect(hasLeadingWhitespace(T.STRONG_STAR_END())).toBe(false);
  });

  test("hasTrailingWhitespaces", () => {
    expect(hasTrailingWhitespace("test string ")).toBe(true);
    expect(hasTrailingWhitespace(" hello")).toBe(false);
    expect(hasTrailingWhitespace(T.SOFT_LINE_BREAK())).toBe(true);
    expect(hasTrailingWhitespace(T.EM_STAR_START())).toBe(false);
  });

  describe("greedilyTakeLeadingWhitespace", () => {
    test("single string", () => {
      let stream = [T.STRONG_STAR_START(), " test"];

      expect(greedilyTakeLeadingWhiteSpace(stream, 1)).toEqual({
        leadingSpaces: [" "],
        trailingStream: [],
        splitLeadingString: "test"
      });
    });

    test("complex case", () => {
      let stream1 = [
        " ",
        T.SOFT_LINE_BREAK(),
        "\t\ttest\n",
        T.STRONG_STAR_START(),
        "some stuff",
        T.STRONG_STAR_END()
      ];

      expect(greedilyTakeLeadingWhiteSpace(stream1, 0)).toEqual({
        leadingSpaces: [" ", T.SOFT_LINE_BREAK(), "\t\t"],
        trailingStream: [
          T.STRONG_STAR_START(),
          "some stuff",
          T.STRONG_STAR_END()
        ],
        splitLeadingString: "test\n"
      });
    });
  });

  describe("greedilyTakeTrailingWhitespace", () => {
    test("stops taking whitespace if it reaches a string with trailing spaces", () => {
      let stream = [T.EM_STAR_START(), " ", "-italic- ", T.EM_STAR_END()];

      expect(greedilyTakeTrailingWhiteSpace(stream, 2)).toEqual({
        trailingSpaces: [" "],
        leadingStream: [T.EM_STAR_START(), " "],
        splitTrailingString: "-italic-"
      });
    });

    test("a complex case", () => {
      let stream = ["some stuff\n", T.SOFT_LINE_BREAK(), "\t\n"];

      expect(greedilyTakeTrailingWhiteSpace(stream, 2)).toEqual({
        trailingSpaces: ["\n", T.SOFT_LINE_BREAK(), "\t\n"],
        leadingStream: [],
        splitTrailingString: "some stuff"
      });
    });

    test("a simple case", () => {
      let stream = ["bold text ", T.STRONG_STAR_END(), "some other text"];

      expect(greedilyTakeTrailingWhiteSpace(stream, 0)).toEqual({
        trailingSpaces: [" "],
        leadingStream: [],
        splitTrailingString: "bold text"
      });
    });
  });
});

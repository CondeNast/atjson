import {
  fixDelimiterRuns,
  flattenStreams,
  mergeStrings,
  splitLines,
  streamIncludes,
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

    test.only("fixing deeply nested stuff", () => {
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
    let stream = ["test\n", T.ATX_HEADING_2(), "this is a heading"];

    expect(streamIncludes(stream, "heading")).toBe(true);

    expect(streamIncludes(stream, T.ATX_HEADING_2())).toBe(true);

    expect(streamIncludes(stream, "test\nthis")).toBe(false);
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

import { generateColumnName } from "../src/utils/convert-html-tables";

describe("generateColumnName", () => {
  test("produces unique names", () => {
    let name1 = generateColumnName("test", 1);
    let name2 = generateColumnName("test", 2);

    expect(name1).not.toBe(name2);
  });

  test("makes the first letter lowercase", () => {
    expect(generateColumnName("WIRED", 0)[0]).toBe("w");
  });

  test("replaces whitespace and hyphens with underscores", () => {
    expect(
      generateColumnName(
        "the swift\u0009brown\u000Bfox\u000Cjumps\u00A0over\uFEFFthe\u2000lazy\u1680sheep-dog",
        0
      )
    ).toBe("the_swift_brown_fox_jumps_over_the_lazy_sheep_dog__1");
  });

  test("removes non-ascii characters", () => {
    expect(generateColumnName("名前", 0)).toBe("column_1__1");
  });
});

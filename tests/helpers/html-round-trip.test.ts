import { fixtureDigest, semanticDiffFingerprint } from "./html-round-trip";

test("semantic fingerprints preserve text, ranges, array order and missing values", () => {
  const expected = {
    text: "A\u00a0B",
    marks: [{ id: "slice", range: "(0..3]", attributes: { refs: ["quote"] } }],
  };
  const fingerprint = semanticDiffFingerprint(expected, expected);
  expect(
    semanticDiffFingerprint(expected, { ...expected, text: "A B" }),
  ).not.toBe(fingerprint);
  expect(
    semanticDiffFingerprint(expected, { ...expected, marks: [] }),
  ).not.toBe(fingerprint);
  expect(
    semanticDiffFingerprint(expected, { ...expected, extra: undefined }),
  ).not.toBe(fingerprint);
  expect(semanticDiffFingerprint([1, 2], [2, 1])).not.toBe(
    semanticDiffFingerprint([1, 2], [1, 2]),
  );
});

test("object key order cannot cause a false failure change", () => {
  expect(semanticDiffFingerprint({ a: 1, b: 2 }, { a: 3, b: 4 })).toBe(
    semanticDiffFingerprint({ b: 2, a: 1 }, { b: 4, a: 3 }),
  );
  expect(fixtureDigest("content")).not.toBe(fixtureDigest("content\n"));
});

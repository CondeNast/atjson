import { createHash } from "node:crypto";

function ordered(value: unknown): unknown {
  if (Array.isArray(value)) return ["array", value.map(ordered)];
  if (value !== null && typeof value === "object") {
    return [
      "object",
      Object.keys(value)
        .sort()
        .map((key) => [key, ordered((value as Record<string, unknown>)[key])]),
    ];
  }
  if (value === undefined) return ["undefined"];
  if (value === null) return ["null"];
  return [typeof value, Object.is(value, -0) ? "-0" : value];
}

export function fixtureDigest(contents: string): string {
  return createHash("sha256").update(contents).digest("hex");
}

/** Object key ordering is immaterial; every text, range, mark and value remains. */
export function semanticDiffFingerprint(
  expected: unknown,
  actual: unknown,
): string {
  return fixtureDigest(JSON.stringify(ordered({ expected, actual })));
}

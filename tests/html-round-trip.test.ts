import HTMLRenderer from "@atjson/renderer-html";
import HTMLSource from "@atjson/source-html";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { isDeepStrictEqual } from "node:util";
import OffsetSource from "@atjson/offset-annotations";
import { serialize } from "@atjson/document";
import knownFailures from "./html-round-trip-known-failures.json";
import {
  fixtureDigest,
  semanticDiffFingerprint,
} from "./helpers/html-round-trip";

interface KnownFailure {
  routeId: string;
  fixture: string;
  fixtureSha256: string;
  semanticDiffSha256: string;
  baselineSha: string;
  owner: string;
  issue: string;
  reviewDate: string;
  expires: string;
}
const known = knownFailures.failures as KnownFailure[];
const results: Array<Record<string, unknown>> = [];
const FIXTURES = readdirSync(join(__dirname, "fixtures", "html"))
  .sort()
  .map((filename) => [
    filename,
    readFileSync(join(__dirname, "fixtures", "html", filename), "utf8"),
  ]);

describe("HTML round trip", () => {
  test.each(FIXTURES)("%s", (filename, contents) => {
    const document = HTMLSource.fromRaw(contents).convertTo(OffsetSource);
    const generatedHTML = HTMLRenderer.render(document);
    const reparsed = HTMLSource.fromRaw(generatedHTML).convertTo(OffsetSource);
    const expected = serialize(document, { withStableIds: true });
    const actual = serialize(reparsed, { withStableIds: true });
    const equal = isDeepStrictEqual(expected, actual);
    const record = known.find(
      (entry) =>
        entry.fixture === filename &&
        entry.routeId === "atjson-html-round-trip",
    );
    const evidence = {
      fixture: filename,
      fixtureSha256: fixtureDigest(contents),
      semanticDiffSha256: semanticDiffFingerprint(expected, actual),
    };
    const matchesKnownFailure =
      record &&
      !equal &&
      evidence.fixtureSha256 === record.fixtureSha256 &&
      evidence.semanticDiffSha256 === record.semanticDiffSha256 &&
      Date.parse(record.expires) > Date.now();
    results.push({
      ...evidence,
      status: matchesKnownFailure
        ? "known-failure"
        : equal && !record
          ? "pass"
          : "fail",
      ...(record
        ? {
            owner: record.owner,
            issue: record.issue,
            baselineSha: record.baselineSha,
            expires: record.expires,
          }
        : {}),
    });
    if (record) {
      // This is an executed expected failure: a fix, changed failure, edited
      // fixture, or expired review all fail until this record is reviewed.
      expect(record.baselineSha).toMatch(/^[a-f0-9]{40}$/);
      expect(Date.parse(record.expires)).toBeGreaterThan(Date.now());
      expect(evidence.fixtureSha256).toBe(record.fixtureSha256);
      expect(equal).toBe(false);
      expect(evidence.semanticDiffSha256).toBe(record.semanticDiffSha256);
    } else {
      expect(actual).toEqual(expected);
    }
  });
});

test("known failures reference unique existing fixtures and an accountable review", () => {
  expect(knownFailures.schemaVersion).toBe(1);
  expect(new Set(known.map((entry) => entry.fixture)).size).toBe(known.length);
  for (const entry of known) {
    expect(entry.routeId).toBe("atjson-html-round-trip");
    expect(FIXTURES.map(([filename]) => filename)).toContain(entry.fixture);
    expect(entry.owner).toBe("Copilot maintainers");
    expect(entry.issue).toBe(
      "https://cnissues.atlassian.net/browse/COPILOT-13315",
    );
    expect(Date.parse(entry.reviewDate)).toBeLessThan(
      Date.parse(entry.expires),
    );
  }
});

afterAll(() => {
  const report = {
    schemaVersion: 1,
    routeId: "atjson-html-round-trip",
    cases: results,
  };
  if (process.env.ATJSON_HTML_ROUND_TRIP_REPORT) {
    writeFileSync(
      process.env.ATJSON_HTML_ROUND_TRIP_REPORT,
      `${JSON.stringify(report, null, 2)}\n`,
    );
  }
  const recorded = results.filter((entry) => entry.status === "known-failure");
  if (recorded.length)
    process.stdout.write(
      `Known HTML round-trip failures (${recorded.length}): ${recorded.map((entry) => `${entry.fixture} — ${entry.issue}`).join(", ")}\n`,
    );
});

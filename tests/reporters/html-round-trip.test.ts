import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import HtmlRoundTripReporter, { collectReport } from "./html-round-trip.cjs";

let root: string;
let originalReport: string | undefined;
const known = {
  fixture: "known.html",
  routeId: "atjson-html-round-trip",
  fixtureSha256: createHash("sha256").update("known").digest("hex"),
  semanticDiffSha256: "a".repeat(64),
  baselineSha: "b".repeat(40),
  owner: "AtJSON maintainers",
  issue: "https://github.com/CondeNast/atjson/issues/123",
  expires: "2050-01-01T00:00:00.000Z",
};
const results = () => ({
  wasInterrupted: false,
  testResults: [
    {
      testFilePath: join(root, "tests/html-round-trip.test.ts"),
      testResults: [
        {
          fullName: "HTML round trip known.html",
          status: "passed",
          numPassingAsserts: 5,
        },
        {
          fullName: "HTML round trip ordinary.html",
          status: "passed",
          numPassingAsserts: 1,
        },
        {
          fullName:
            "known failures reference unique existing fixtures and an accountable review",
          status: "passed",
          numPassingAsserts: 7,
        },
      ],
    },
  ],
});
const ledger = (failures = [known]) =>
  writeFileSync(
    join(root, "tests/html-round-trip-known-failures.json"),
    JSON.stringify({ schemaVersion: 1, failures }),
  );

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "atjson-html-reporter-"));
  mkdirSync(join(root, "tests/fixtures/html"), { recursive: true });
  writeFileSync(join(root, "tests/fixtures/html/known.html"), "known");
  writeFileSync(join(root, "tests/fixtures/html/ordinary.html"), "ordinary");
  ledger();
  originalReport = process.env.ATJSON_HTML_ROUND_TRIP_REPORT;
  delete process.env.ATJSON_HTML_ROUND_TRIP_REPORT;
  jest.spyOn(process.stdout, "write").mockImplementation(() => true);
  jest.spyOn(process.stderr, "write").mockImplementation(() => true);
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
  if (originalReport === undefined)
    delete process.env.ATJSON_HTML_ROUND_TRIP_REPORT;
  else process.env.ATJSON_HTML_ROUND_TRIP_REPORT = originalReport;
  jest.restoreAllMocks();
});

test("collects exact executed fixture outcomes and verified registry metadata", () => {
  const report = collectReport(root, results());
  expect(report).toEqual({
    schemaVersion: 1,
    routeId: "atjson-html-round-trip",
    cases: [
      {
        fixture: known.fixture,
        fixtureSha256: known.fixtureSha256,
        status: "known-failure",
        semanticDiffSha256: known.semanticDiffSha256,
        baselineSha: known.baselineSha,
        owner: known.owner,
        issue: known.issue,
        expires: known.expires,
      },
      {
        fixture: "ordinary.html",
        fixtureSha256: createHash("sha256").update("ordinary").digest("hex"),
        status: "pass",
      },
    ],
  });
});

test.each(["failed", "pending", "todo", "disabled"])(
  "does not turn a %s known-discrepancy test into confirmed evidence",
  (status) => {
    const execution = results();
    execution.testResults[0].testResults[0].status = status;
    const result = collectReport(root, execution).cases[0];
    expect(result.status).toBe("fail");
    expect(result.semanticDiffSha256).toBeUndefined();
  },
);

test("rejects missing, duplicate, and assertion-free fixture results", () => {
  for (const mutate of [
    (execution: ReturnType<typeof results>) =>
      execution.testResults[0].testResults.shift(),
    (execution: ReturnType<typeof results>) =>
      execution.testResults[0].testResults.push(
        execution.testResults[0].testResults[0],
      ),
    (execution: ReturnType<typeof results>) => {
      execution.testResults[0].testResults[0].numPassingAsserts = 0;
    },
  ]) {
    const execution = results();
    mutate(execution);
    expect(collectReport(root, execution).cases[0].status).toBe("fail");
  }
});

test("cannot report passing fixtures after interruption or missing accountability", () => {
  const execution = results();
  execution.wasInterrupted = true;
  expect(
    collectReport(root, execution).cases.every(
      (entry: { status: string }) => entry.status === "fail",
    ),
  ).toBe(true);
  execution.wasInterrupted = false;
  execution.testResults[0].testResults.pop();
  expect(
    collectReport(root, execution).cases.every(
      (entry: { status: string }) => entry.status === "fail",
    ),
  ).toBe(true);
  execution.testResults = [];
  expect(
    collectReport(root, execution).cases.every(
      (entry: { status: string }) => entry.status === "fail",
    ),
  ).toBe(true);
});

test("rejects expired entries and fixtures changed since the asserted run", () => {
  expect(
    collectReport(root, results(), Date.parse(known.expires)).cases[0].status,
  ).toBe("fail");
  writeFileSync(join(root, "tests/fixtures/html/known.html"), "changed");
  expect(collectReport(root, results()).cases[0].status).toBe("fail");
});

test("rejects duplicate and nonexistent registry fixture identities", () => {
  ledger([known, known]);
  expect(() => collectReport(root, results())).toThrow(
    "Invalid HTML round-trip discrepancy registry",
  );
  ledger([{ ...known, fixture: "missing.html" }]);
  expect(() => collectReport(root, results())).toThrow(
    "Invalid HTML round-trip discrepancy registry",
  );
});

test.each([
  { ...known, issue: "https://tracker.example.invalid/PRIVATE-123" },
  { ...known, issue: "https://github.com/example/private-repo/issues/123" },
  {
    ...known,
    issue: "https://github.com/CondeNast/atjson/issues/123?token=private",
  },
  { ...known, owner: "Private downstream team" },
])("rejects nonpublic tracking metadata before producing output", (record) => {
  ledger([record]);
  const file = join(root, "report.json");
  process.env.ATJSON_HTML_ROUND_TRIP_REPORT = file;
  const reporter = new HtmlRoundTripReporter({ rootDir: root });
  reporter.onRunStart();
  reporter.onRunComplete(new Set(), results());
  expect(reporter.getLastError().message).toBe(
    "Invalid HTML round-trip discrepancy registry.",
  );
  expect(JSON.parse(readFileSync(file, "utf8")).cases).toEqual([]);
  expect(process.stdout.write).not.toHaveBeenCalled();
  expect(process.stderr.write).toHaveBeenCalledWith(
    "HTML round-trip reporter: Invalid HTML round-trip discrepancy registry.\n",
  );
});

test("reporter writes the artifact outside the suite and surfaces incomplete execution", () => {
  const file = join(root, "reports/html.json");
  process.env.ATJSON_HTML_ROUND_TRIP_REPORT = file;
  const reporter = new HtmlRoundTripReporter({ rootDir: root });
  reporter.onRunStart();
  reporter.onRunComplete(new Set(), results());
  expect(JSON.parse(readFileSync(file, "utf8"))).toEqual(
    collectReport(root, results()),
  );
  expect(reporter.getLastError()).toBeUndefined();
  reporter.onRunComplete(new Set(), { testResults: [] });
  expect(reporter.getLastError()).toBeInstanceOf(Error);
  expect(
    JSON.parse(readFileSync(file, "utf8")).cases.every(
      (entry: { status: string }) => entry.status === "fail",
    ),
  ).toBe(true);
});

test("unrelated test runs do not require the HTML suite without a requested artifact", () => {
  const reporter = new HtmlRoundTripReporter({ rootDir: root });
  reporter.onRunComplete(new Set(), { testResults: [] });
  expect(reporter.getLastError()).toBeUndefined();
  expect(process.stdout.write).not.toHaveBeenCalled();
});

test("focused debugging retains Jest selection semantics when no artifact is requested", () => {
  const reporter = new HtmlRoundTripReporter({ rootDir: root });
  reporter.onRunStart();
  const execution = results();
  execution.testResults[0].testResults[0].status = "pending";
  reporter.onRunComplete(new Set(), execution);
  expect(reporter.getLastError()).toBeUndefined();
});

test("reporter write failures fail Jest rather than silently losing evidence", () => {
  process.env.ATJSON_HTML_ROUND_TRIP_REPORT = join(root, "tests/fixtures/html");
  const reporter = new HtmlRoundTripReporter({ rootDir: root });
  reporter.onRunStart();
  reporter.onRunComplete(new Set(), results());
  expect(reporter.getLastError()).toMatchObject({ code: "EISDIR" });
});

test.each([
  [
    "fingerprint",
    () => ledger([{ ...known, semanticDiffSha256: "c".repeat(64) }]),
  ],
  ["metadata", () => ledger([{ ...known, owner: "changed owner" }])],
  [
    "fixture",
    () =>
      writeFileSync(join(root, "tests/fixtures/html/ordinary.html"), "changed"),
  ],
])(
  "does not attach unasserted %s changes to earlier passing results",
  (_name, mutate) => {
    const file = join(root, "report.json");
    process.env.ATJSON_HTML_ROUND_TRIP_REPORT = file;
    const reporter = new HtmlRoundTripReporter({ rootDir: root });
    reporter.onRunStart();
    (mutate as () => void)();
    reporter.onRunComplete(new Set(), results());
    expect(reporter.getLastError().message).toContain(
      "changed during the Jest run",
    );
    expect(JSON.parse(readFileSync(file, "utf8")).cases).toEqual([]);
  },
);

test("requires a run-start snapshot before producing a requested execution artifact", () => {
  process.env.ATJSON_HTML_ROUND_TRIP_REPORT = join(root, "report.json");
  const reporter = new HtmlRoundTripReporter({ rootDir: root });
  reporter.onRunComplete(new Set(), results());
  expect(reporter.getLastError()).toBeInstanceOf(Error);
});

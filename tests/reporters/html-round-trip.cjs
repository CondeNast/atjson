const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");

const ROUTE = "atjson-html-round-trip";
const SUITE = "tests/html-round-trip.test.ts";
const ACCOUNTABILITY =
  "known failures reference unique existing fixtures and an accountable review";

function snapshotInputs(root) {
  const directory = path.join(root, "tests/fixtures/html");
  const hash = createHash("sha256");
  hash.update(
    fs.readFileSync(
      path.join(root, "tests/html-round-trip-known-failures.json"),
    ),
  );
  for (const fixture of fs.readdirSync(directory).sort()) {
    hash.update(JSON.stringify(fixture));
    hash.update(
      createHash("sha256")
        .update(fs.readFileSync(path.join(directory, fixture)))
        .digest(),
    );
  }
  return hash.digest("hex");
}

function collectReport(root, results, now = Date.now()) {
  const directory = path.join(root, "tests/fixtures/html");
  const fixtures = fs.readdirSync(directory).sort();
  const ledger = JSON.parse(
    fs.readFileSync(
      path.join(root, "tests/html-round-trip-known-failures.json"),
      "utf8",
    ),
  );
  if (
    ledger.schemaVersion !== 1 ||
    !Array.isArray(ledger.failures) ||
    new Set(ledger.failures.map((entry) => entry.fixture)).size !==
      ledger.failures.length ||
    ledger.failures.some((entry) => !fixtures.includes(entry.fixture))
  ) {
    throw new Error("Invalid HTML round-trip discrepancy registry.");
  }
  const suites = results.testResults.filter(
    (result) => result.testFilePath === path.join(root, SUITE),
  );
  const assertions = suites.length === 1 ? suites[0].testResults : [];
  const passed = (name, minimumAssertions) => {
    const matches = assertions.filter((result) => result.fullName === name);
    return (
      !results.wasInterrupted &&
      !suites[0]?.testExecError &&
      matches.length === 1 &&
      matches[0].status === "passed" &&
      matches[0].numPassingAsserts >= minimumAssertions
    );
  };
  const accountable = passed(ACCOUNTABILITY, 1);
  const cases = fixtures.map((fixture) => {
    const fixtureSha256 = createHash("sha256")
      .update(fs.readFileSync(path.join(directory, fixture)))
      .digest("hex");
    const record = ledger.failures.find((entry) => entry.fixture === fixture);
    const completed =
      accountable && passed(`HTML round trip ${fixture}`, record ? 5 : 1);
    const confirmed =
      completed &&
      record &&
      record.routeId === ROUTE &&
      record.fixtureSha256 === fixtureSha256 &&
      Date.parse(record.expires) > now;
    return {
      fixture,
      fixtureSha256,
      status: record
        ? confirmed
          ? "known-failure"
          : "fail"
        : completed
          ? "pass"
          : "fail",
      // The passing test asserted this exact fingerprint and registry metadata.
      // Failed or unexecuted cases cannot borrow a registry entry as evidence.
      ...(confirmed
        ? {
            semanticDiffSha256: record.semanticDiffSha256,
            baselineSha: record.baselineSha,
            owner: record.owner,
            issue: record.issue,
            expires: record.expires,
          }
        : {}),
    };
  });
  return { schemaVersion: 1, routeId: ROUTE, cases };
}

class HtmlRoundTripReporter {
  constructor(globalConfig) {
    this.root = globalConfig.rootDir;
    this.reportFile = process.env.ATJSON_HTML_ROUND_TRIP_REPORT;
  }

  onRunStart() {
    this.error = undefined;
    this.inputError = undefined;
    this.inputs = undefined;
    try {
      this.inputs = snapshotInputs(this.root);
    } catch (error) {
      this.inputError = error;
    }
  }

  onRunComplete(_contexts, results) {
    if (
      !this.reportFile &&
      !results.testResults.some(
        (result) => result.testFilePath === path.join(this.root, SUITE),
      )
    )
      return;
    let report = { schemaVersion: 1, routeId: ROUTE, cases: [] };
    try {
      if (this.inputError) throw this.inputError;
      if (!this.inputs || this.inputs !== snapshotInputs(this.root))
        throw new Error(
          "HTML fixtures or discrepancy registry changed during the Jest run.",
        );
      report = collectReport(this.root, results);
      // A focused debugging run may select only part of the suite; a requested
      // execution artifact must still cover every case.
      if (
        this.reportFile &&
        (!report.cases.length ||
          report.cases.some((entry) => entry.status === "fail"))
      )
        throw new Error(
          "HTML round-trip assertions failed or execution was incomplete.",
        );
    } catch (error) {
      this.error = error;
    }
    if (this.reportFile) {
      try {
        fs.mkdirSync(path.dirname(this.reportFile), { recursive: true });
        fs.writeFileSync(
          this.reportFile,
          `${JSON.stringify(report, null, 2)}\n`,
        );
      } catch (error) {
        this.error = error;
      }
    }
    const recorded = report.cases.filter(
      (entry) => entry.status === "known-failure",
    );
    if (recorded.length) {
      process.stdout.write(
        `Confirmed HTML round-trip discrepancies (${recorded.length}, asserted): ${recorded.map((entry) => `${entry.fixture} — ${entry.issue}`).join(", ")}\n`,
      );
    }
    if (this.error)
      process.stderr.write(`HTML round-trip reporter: ${this.error.message}\n`);
  }

  getLastError() {
    return this.error;
  }
}

module.exports = HtmlRoundTripReporter;
module.exports.collectReport = collectReport;

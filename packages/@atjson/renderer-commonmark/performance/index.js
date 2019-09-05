const OffsetSource = require("@atjson/offset-annotations").default;
const CommonMarkSource = require("@atjson/source-commonmark").default;
const spec = require("commonmark-spec");
const { performance } = require("perf_hooks");
const CommonMarkRenderer = require("../dist/commonjs/index").default;
const { readFileSync } = require("fs");
const { join } = require("path");
const os = require("os");
const osName = require("os-name");

const skippedTests = [
  140, // Additional newline in HTML block
  491 // Alt text that is never used
];

class Statistics {
  constructor(name) {
    this.name = name;
    this.entries = performance
      .getEntriesByName(name)
      .sort((a, b) => a.duration - b.duration);
  }

  // Not completely correct, but it's good enough for this
  percentile(percent) {
    let index = (this.entries.length - 1) * percent;
    return this.entries[Math.floor(index)].duration;
  }

  get median() {
    return this.percentile(0.5);
  }

  get mean() {
    return this.totalTime / this.entries.length;
  }

  get max() {
    return this.entries[this.entries.length - 1].duration;
  }

  get totalTime() {
    return this.entries.reduce((totalTime, entry) => {
      return totalTime + entry.duration;
    }, 0);
  }

  get standardDeviation() {
    let mean = this.mean;

    let squaredDifferences = this.entries.map(entry => {
      var diff = entry.duration - mean;
      return diff * diff;
    });

    let averageOfSquaredDifferences =
      squaredDifferences.reduce((E, diff) => {
        return E + diff;
      }, 0) / squaredDifferences.length;

    return Math.sqrt(averageOfSquaredDifferences);
  }
}

function measure(name, fn) {
  performance.mark(`⏱ ${name}`);
  let result = fn();
  performance.mark(`🏁 ${name}`);
  performance.measure(name, `⏱ ${name}`, `🏁 ${name}`);
  performance.clearMarks(`⏱ ${name}`);
  performance.clearMarks(`🏁 ${name}`);
  return result;
}

performance.maxEntries = spec.tests.length * 400;

for (let i = 0; i < 100; i++) {
  spec.tests.forEach(unitTest => {
    let shouldSkip = skippedTests.indexOf(unitTest.number) !== -1;
    if (shouldSkip) {
      return;
    }

    performance.mark("start");
    let markdown = unitTest.markdown.replace(/→/g, "\t");
    let original = measure("CommonMarkSource.fromRaw", () =>
      CommonMarkSource.fromRaw(markdown)
    );
    let converted = measure("CommonMarkSource.convertTo(OffsetSource)", () =>
      original.convertTo(OffsetSource)
    );
    measure("CommonMarkRenderer.render", () =>
      CommonMarkRenderer.render(converted)
    );
    performance.mark("end");
    performance.measure("Round trip", "start", "end");
    performance.clearMarks();
  });
}

console.log(
  [
    "# ⏱ Performance",
    "",
    `The metrics below are taken from the CommonMark specification tests. These are _not_ realistic examples of what you'd find out in the world, but it is a fairly large dataset that runs the code through its paces.`,
    "",
    `This benchmark was taken on ${osName(
      os.platform(),
      os.release()
    )} on ${os.arch()} with ${os.cpus().length} cores of ${
      os.cpus()[0].model
    }.`,
    "",
    "| Function | Mean | Median | 95th Percentile | Maximum | Standard Deviation |",
    "|----------|------|--------|-----------------|---------|--------------------|",
    ...[
      new Statistics("CommonMarkSource.fromRaw"),
      new Statistics("CommonMarkSource.convertTo(OffsetSource)"),
      new Statistics("CommonMarkRenderer.render"),
      new Statistics("Round trip")
    ].map(stats => {
      return `| ${stats.name} | ${stats.mean.toFixed(
        3
      )}ms | ${stats.median.toFixed(3)}ms | ${stats
        .percentile(0.95)
        .toFixed(3)}ms | ${stats.max}ms | ${stats.standardDeviation.toFixed(
        3
      )}ms |`;
    })
  ].join("\n")
);

// Clear all measures in-between performance tests
performance.clearMeasures();

// Slow real-life tests
let fixtures = [
  "alexander-mcqueen.md",
  "lambda-literary-awards.md",
  "inoa-listings.md" // ~1s
].map(filename =>
  readFileSync(join(__dirname, "fixtures", filename)).toString()
);

for (let i = 0; i < 10; i++) {
  fixtures.forEach(markdown => {
    performance.mark("start");
    let original = measure("CommonMarkSource.fromRaw", () =>
      CommonMarkSource.fromRaw(markdown)
    );
    let converted = measure("CommonMarkSource.convertTo(OffsetSource)", () =>
      original.convertTo(OffsetSource)
    );
    measure("CommonMarkRenderer.render", () =>
      CommonMarkRenderer.render(converted)
    );
    performance.mark("end");
    performance.measure("Round trip", "start", "end");
    performance.clearMarks();
  });
}

console.log(
  [
    "",
    "",
    "## 🔥 Slow real-life examples",
    "",
    `The metrics below are taken from real articles written by Condé Nast editors / writers.`,
    "",
    `This benchmark was taken on ${osName(
      os.platform(),
      os.release()
    )} on ${os.arch()} with ${os.cpus().length} cores of ${
      os.cpus()[0].model
    }.`,
    "",
    "| Function | Mean | Median | 95th Percentile | Maximum | Standard Deviation |",
    "|----------|------|--------|-----------------|---------|--------------------|",
    ...[
      new Statistics("CommonMarkSource.fromRaw"),
      new Statistics("CommonMarkSource.convertTo(OffsetSource)"),
      new Statistics("CommonMarkRenderer.render"),
      new Statistics("Round trip")
    ].map(stats => {
      return `| ${stats.name} | ${stats.mean.toFixed(
        3
      )}ms | ${stats.median.toFixed(3)}ms | ${stats
        .percentile(0.95)
        .toFixed(3)}ms | ${stats.max}ms | ${stats.standardDeviation.toFixed(
        3
      )}ms |`;
    })
  ].join("\n")
);

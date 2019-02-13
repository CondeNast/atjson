const OffsetSource = require('@atjson/offset-annotations').default;
const CommonMarkSource = require('@atjson/source-commonmark').default;
const spec = require('commonmark-spec');
const MarkdownIt = require('markdown-it');
const { performance } = require('perf_hooks');
const CommonMarkRenderer = require('../dist/commonjs/index').default;
const os = require('os');
const osName = require('os-name');

const skippedTests = [
  140, // Additional newline in HTML block
  491  // Alt text that is never used
];

class Statistics {
  constructor(name) {
    this.name = name;
    this.entries = performance.getEntriesByName(name).sort((a, b) => a.duration - b.duration);
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
    return this.entries.reduce((totalTime, entry) => {
      return totalTime + entry.duration;
    }, 0) / this.entries.length;
  }

  get standardDeviation() {
    let mean = this.mean;

    let squaredDifferences = this.entries.map((entry) => {
      var diff = entry.duration - mean;
      return diff * diff;
    });

    let averageOfSquaredDifferences = squaredDifferences.reduce((E, diff) => {
      return E + diff;
    }, 0) / squaredDifferences.length;

    return Math.sqrt(averageOfSquaredDifferences);
  }
}

function measure(name, fn) {
  performance.mark('⏱');
  let result = fn();
  performance.mark('🏁');
  performance.measure(name, '⏱', '🏁');
  performance.clearMarks('⏱');
  performance.clearMarks('🏁');
  return result;
}

performance.maxEntries = spec.tests.length * 5;
spec.tests.forEach((unitTest) => {
  let md = MarkdownIt('commonmark');

  let shouldSkip = skippedTests.indexOf(unitTest.number) !== -1;
  if (shouldSkip) {
    return;
  }

  performance.mark('start');
  let markdown = unitTest.markdown.replace(/→/g, '\t');
  let original = measure('CommonMarkSource.fromRaw', () => CommonMarkSource.fromRaw(markdown));
  let converted = measure('CommonMarkSource.convertTo(OffsetSource)', () => original.convertTo(OffsetSource));
  let generatedMarkdown = measure('CommonMarkRenderer.render', () => CommonMarkRenderer.render(converted));
  performance.mark('end');
  performance.measure('Round trip', 'start', 'end');
  performance.clearMarks();

  measure('MarkdownIt.render', () => md.render(generatedMarkdown));
});

console.log(
  [
    '# ⏱ Performance',
    '',
    `The metrics below are taken from the CommonMark specification tests. These are _not_ realistic examples of what you'd find out in the world, but it is a fairly large dataset that runs the code through its paces.`,
    '',
    `This benchmark was taken on ${osName(os.platform(), os.release())} on ${os.arch()} with ${os.cpus().length} cores of ${os.cpus()[0].model}.`,
    '',
    '| Function | Mean | Median | 95th Percentile | Standard Deviation |',
    '|----------|------|--------|-----------------|--------------------|',
    ...[
      new Statistics('CommonMarkSource.fromRaw'),
      new Statistics('CommonMarkSource.convertTo(OffsetSource)'),
      new Statistics('CommonMarkRenderer.render'),
      new Statistics('MarkdownIt.render'),
      new Statistics('Round trip')
    ].map(stats => {
      return `| ${stats.name} | ${stats.mean.toFixed(3)}ms | ${stats.median.toFixed(3)}ms | ${stats.percentile(0.95).toFixed(3)}ms | ${stats.standardDeviation.toFixed(3)}ms |`;
    })
  ].join('\n')
);
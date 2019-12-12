declare function ttest(
  sampleA: number[] | DataSummary,
  sampleB: number[] | DataSummary,
  options?: TestOptions
): Stat;

declare function ttest(sample: number[] | DataSummary, options?: TestOptions);

interface TestOptions {
  mu?: number;
  varEqual?: boolean;
  alpha?: number;
  alternative?: "less" | "greater" | "not equal";
}

interface DataSummary {
  mean: number;
  variance: number;
  size: number;
}

interface Stat {
  testValue(): number;
  pValue(): number;
  confidence(): number[];
  valid(): boolean;
  freedom(): number;
}

export = ttest;

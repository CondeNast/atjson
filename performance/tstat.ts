/* eslint-env node */
import { calculateTStat } from "./src";

async function run() {
  const baselineOptionIndex = process.argv.indexOf("--baseline");
  const baseline =
    (baselineOptionIndex > -1 && process.argv[baselineOptionIndex + 1]) ||
    "baseline";

  const currentOptionIndex = process.argv.indexOf("--current");
  const current =
    (currentOptionIndex > -1 && process.argv[currentOptionIndex + 1]) ||
    "current";

  await calculateTStat("commonmark-spec", baseline, current);
  await calculateTStat("commonmark-spec equality", baseline, current);
  await calculateTStat("degenerate-markdown", baseline, current);
  await calculateTStat("degenerate-markdown equality", baseline, current);
}

run().then(
  () => {
    process.exit();
  },
  err => {
    throw Error(err);
  }
);

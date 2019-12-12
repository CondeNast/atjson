import ttest = require("ttest");
import { TimingStat } from "./profile";

export function compareStats(stat1: TimingStat, stat2: TimingStat) {
  let ttestStats = ttest(stat1.data, stat2.data);
  return {
    confidenceInterval: ttestStats.confidence(),
    tScore: ttestStats.testValue(),
    pValue: ttestStats.pValue(),
    degreesFreedom: ttestStats.freedom()
  };
}

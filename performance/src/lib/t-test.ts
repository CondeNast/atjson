import ttest = require("ttest");
import { TimingStat, TStat } from "./profile";

const alpha = 0.05;

export function getTStat(stat1: TimingStat, stat2: TimingStat): TStat {
  let ttestStats = ttest(stat1.data, stat2.data, { alpha });
  return {
    confidenceInterval: ttestStats.confidence(),
    tScore: ttestStats.testValue(),
    pValue: ttestStats.pValue(),
    degreesFreedom: ttestStats.freedom(),
    alpha
  };
}

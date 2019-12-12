import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import {
  FunctionStat,
  Profile,
  ProfileStat,
  TimedFunction,
  TimedNode,
  TimedProfile,
  TimingStat
} from "./profile";
import * as stats from "simple-statistics";

interface FunctionInfo {
  functionName: string;
  url: string;
}

function shouldIncludeInSummary(node: TimedFunction) {
  return (
    node.functionName === "(garbage collector)" ||
    node.url.match(/packages\/@atjson/)
  );
}

function toKey(functionInfo: FunctionInfo) {
  return `${functionInfo.url}, ${functionInfo.functionName}`;
}

function createTimedFunction(functionInfo: FunctionInfo) {
  return {
    functionName: functionInfo.functionName || "(anonymous)",
    url: functionInfo.url,
    callCount: 0,
    sampleTime: 0,
    cumulativeTime: 0
  };
}

function timeProfile(profile: Profile): TimedProfile {
  let nodeMap = profile.nodes.reduce(
    (map, node) => map.set(node.id, { ...node, sampleTime: 0 }),
    new Map<number, TimedNode>()
  );

  let cumulativeTime = 0;
  profile.samples.forEach((id, index) => {
    let timeDelta = profile.timeDeltas[index];
    nodeMap.get(id)!.sampleTime += timeDelta;
    cumulativeTime += timeDelta;
  });

  let timedFunctions = new Map<string, TimedFunction>();
  nodeMap.forEach(node => {
    let key = toKey(node.callFrame);
    let timedFunction = timedFunctions.get(key);
    if (!timedFunction) {
      timedFunction = createTimedFunction(node.callFrame);
      timedFunctions.set(key, timedFunction);
    }

    let childTime = node.children
      ? node.children.reduce(
          (sum, childId) => sum + nodeMap.get(childId)!.sampleTime,
          0
        )
      : 0;
    timedFunction.callCount += 1;
    timedFunction.sampleTime += node.sampleTime;
    timedFunction.cumulativeTime += node.sampleTime + childTime;
  });

  return {
    cumulativeTime,
    functions: [...timedFunctions.values()]
      .filter(shouldIncludeInSummary)
      .sort((n1, n2) => n1.cumulativeTime - n2.cumulativeTime)
  };
}

function createTimingStat(): TimingStat {
  return { data: [], quantiles: [], mean: 0 };
}

function calculateStats(timing: TimingStat) {
  let data = timing.data;
  if (data.length) {
    timing.quantiles = [
      stats.min(data),
      stats.quantile(data, 0.25),
      stats.median(data),
      stats.quantile(data, 0.75),
      stats.max(data)
    ];
    timing.mean = stats.mean(data);
    timing.sd = stats.standardDeviation(data);
  }
}

function createFunctionStat(functionInfo: FunctionInfo) {
  return {
    functionName: functionInfo.functionName,
    url: functionInfo.url,
    callCount: [],
    sampleTime: createTimingStat(),
    cumulativeTime: createTimingStat()
  };
}

function summarizeProfiles(timedProfiles: TimedProfile[]): ProfileStat {
  let cumulativeTime = createTimingStat();
  let functionStats = timedProfiles.reduce((map, timedProfile) => {
    cumulativeTime.data.push(timedProfile.cumulativeTime);
    timedProfile.functions.forEach(timedFunction => {
      let key = toKey(timedFunction);
      let functionStat = map.get(key);
      if (!functionStat) {
        functionStat = createFunctionStat(timedFunction);
        map.set(key, functionStat);
      }

      functionStat.callCount.push(timedFunction.callCount);
      functionStat.sampleTime.data.push(timedFunction.sampleTime);
      functionStat.cumulativeTime.data.push(timedFunction.cumulativeTime);
    });
    return map;
  }, new Map<string, FunctionStat>());

  calculateStats(cumulativeTime);
  functionStats.forEach(functionStat => {
    calculateStats(functionStat.sampleTime);
    calculateStats(functionStat.cumulativeTime);
  });

  return {
    cumulativeTime,
    functionStats: [...functionStats.values()].sort(
      (s1, s2) => s2.cumulativeTime.mean - s1.cumulativeTime.mean
    )
  };
}

export function summarize(name: string) {
  let directory = join(__dirname, "../..", "profiles", name);
  let files = readdirSync(directory);

  let timedProfiles = files
    .filter(filename => filename.endsWith(".cpuprofile"))
    .map(filename => {
      let profile = JSON.parse(
        readFileSync(join(directory, filename)).toString()
      ) as Profile;
      return timeProfile(profile);
    });
  let profileStat = summarizeProfiles(timedProfiles);
  writeFileSync(join(directory, "timing.json"), JSON.stringify(profileStat));
}

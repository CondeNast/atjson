import { readdirSync, readFileSync, writeFileSync } from "fs";
import * as inspector from "inspector";
import { join } from "path";
import * as stats from "simple-statistics";

export const TIMING_FILE = "timing.json";

export type TimedNode = inspector.Profiler.ProfileNode & {
  sampleTime: number;
};

export type TimedFunction = {
  functionName: string;
  url: string;
  callCount: number;
  sampleTime: number;
  cumulativeTime: number;
};

export type TimedProfile = {
  cumulativeTime: number;
  functions: TimedFunction[];
};

export type TimingStat = {
  data: number[];
  mean: number;
  sd?: number;
  quantiles: number[];
};

export type FunctionTiming = {
  functionName: string;
  url: string;
  callCount: number[];
  sampleTime: TimingStat;
  cumulativeTime: TimingStat;
};

export type ProfileStat = {
  cumulativeTime: TimingStat;
  functions: FunctionTiming[];
};

function shouldIncludeInSummary(node: TimedFunction) {
  return (
    node.functionName === "(garbage collector)" ||
    node.url.match(/packages\/@atjson/)
  );
}

function toKey(functionInfo: { url: string; functionName: string }) {
  return `${functionInfo.url}, ${functionInfo.functionName}`;
}

function createTimedFunction(functionInfo: {
  url: string;
  functionName: string;
}) {
  let relativeIndex = functionInfo.url.indexOf("/packages/");
  let relativeUrl =
    relativeIndex > -1
      ? functionInfo.url.slice(relativeIndex)
      : functionInfo.url;
  return {
    functionName: functionInfo.functionName || "(anonymous)",
    url: relativeUrl,
    callCount: 0,
    sampleTime: 0,
    cumulativeTime: 0
  };
}

function timeProfile(profile: inspector.Profiler.Profile): TimedProfile {
  let nodeMap = profile.nodes.reduce(
    (map, node) => map.set(node.id, { ...node, sampleTime: 0 }),
    new Map<number, TimedNode>()
  );

  let cumulativeTime = 0;
  if (profile.samples && profile.timeDeltas) {
    profile.samples.forEach((id, index) => {
      let timeDelta = profile.timeDeltas![index];
      nodeMap.get(id)!.sampleTime += timeDelta;
      cumulativeTime += timeDelta;
    });
  }

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

function createFunctionStat(functionInfo: {
  url: string;
  functionName: string;
}) {
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
  }, new Map<string, FunctionTiming>());

  calculateStats(cumulativeTime);
  functionStats.forEach(functionStat => {
    calculateStats(functionStat.sampleTime);
    calculateStats(functionStat.cumulativeTime);
  });

  return {
    cumulativeTime,
    functions: [...functionStats.values()].sort(
      (s1, s2) => s2.cumulativeTime.mean - s1.cumulativeTime.mean
    )
  };
}

export function generateTiming(directory: string) {
  return new Promise((resolve, reject) => {
    try {
      let files = readdirSync(directory);
      let timedProfiles = files
        .filter(filename => filename.endsWith(".cpuprofile"))
        .map(filename => {
          let profile = JSON.parse(
            readFileSync(join(directory, filename)).toString()
          ) as inspector.Profiler.Profile;
          return timeProfile(profile);
        });
      let profileStat = summarizeProfiles(timedProfiles);
      writeFileSync(join(directory, TIMING_FILE), JSON.stringify(profileStat));

      resolve(profileStat);
    } catch (error) {
      reject(error);
    }
  });
}

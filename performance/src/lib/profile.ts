import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import * as stats from "simple-statistics";

export type Node = {
  id: number;
  callFrame: {
    functionName: string;
    scriptId: string;
    url: string;
    lineNumber: number;
    columnNumber: number;
  };
  hitCount: number;
  children?: Array<number>;
  positionTicks?: {
    line: number;
    ticks: number;
  };
};

export type TimedNode = Node & {
  sampleTime: number;
};

export type NodeSummary = {
  functionName: string;
  url: string;
  sampleTime: number;
  cumulativeTime: number;
};

export type Profile = {
  nodes: Array<Node>;
  samples: Array<number>;
  timeDeltas: Array<number>;
  startTime: number;
  endTime: number;
};

export type TimingStats = {
  data: number[];
  mean: number;
  sd?: number;
  quantiles: number[];
};

export type TimingSummary = {
  functionName: string;
  url: string;
  sampleTime: TimingStats;
  cumulativeTime: TimingStats;
};

function shouldIncludeInSummary(node: NodeSummary) {
  return (
    node.functionName === "(garbage collector)" ||
    node.url.match(/packages\/@atjson/)
  );
}

function toKey(functionInfo: { functionName: string; url: string }) {
  return `${functionInfo.url}, ${functionInfo.functionName}`;
}

function summarizeProfile(profile: Profile) {
  let nodeMap = profile.nodes.reduce(
    (map, node) => map.set(node.id, { ...node, sampleTime: 0 }),
    new Map<number, TimedNode>()
  );

  profile.samples.forEach((id, index) => {
    nodeMap.get(id)!.sampleTime += profile.timeDeltas[index];
  });

  let summaryMap = new Map<string, NodeSummary>();
  nodeMap.forEach(node => {
    let key = toKey(node.callFrame);
    let summary =
      summaryMap.get(key) ||
      (summaryMap
        .set(key, {
          functionName: node.callFrame.functionName || "(anonymous)",
          url: node.callFrame.url,
          sampleTime: 0,
          cumulativeTime: 0
        })
        .get(key) as NodeSummary);

    let childTime = node.children
      ? node.children.reduce(
          (sum, childId) => sum + nodeMap.get(childId)!.sampleTime,
          0
        )
      : 0;
    summary.sampleTime += node.sampleTime;
    summary.cumulativeTime += node.sampleTime + childTime;
  });

  return [...summaryMap.values()]
    .filter(shouldIncludeInSummary)
    .sort((n1, n2) => n1.cumulativeTime - n2.cumulativeTime);
}

function calculateStats(timing: TimingStats) {
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

function summarizeRuns(runs: Array<Array<NodeSummary>>) {
  let timingSummaries = runs.reduce((map, nodeSummaries) => {
    nodeSummaries.forEach(nodeSummary => {
      let key = toKey(nodeSummary);
      let timingSummary =
        map.get(key) ||
        (map
          .set(key, {
            functionName: nodeSummary.functionName,
            url: nodeSummary.url,
            sampleTime: { data: [], quantiles: [], mean: 0 },
            cumulativeTime: { data: [], quantiles: [], mean: 0 }
          })
          .get(key) as TimingSummary);
      timingSummary.sampleTime.data.push(nodeSummary.sampleTime);
      timingSummary.cumulativeTime.data.push(nodeSummary.cumulativeTime);
    });
    return map;
  }, new Map<string, TimingSummary>());

  timingSummaries.forEach(timingSummary => {
    let { sampleTime, cumulativeTime } = timingSummary;
    calculateStats(sampleTime);
    calculateStats(cumulativeTime);
  });

  return [...timingSummaries.values()].sort(
    (s1, s2) => s2.cumulativeTime.mean - s1.cumulativeTime.mean
  );
}

export function summarize(name: string) {
  let directory = join(__dirname, "../..", "profiles", name);
  let files = readdirSync(directory);

  let runs = files
    .filter(filename => filename.endsWith(".cpuprofile"))
    .map(filename => {
      let profile = JSON.parse(
        readFileSync(join(directory, filename)).toString()
      ) as Profile;
      return summarizeProfile(profile);
    });
  let runStats = summarizeRuns(runs);
  writeFileSync(join(directory, "timing.json"), JSON.stringify(runStats));
}

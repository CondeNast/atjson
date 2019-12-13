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
  children?: number[];
  positionTicks?: {
    line: number;
    ticks: number;
  };
};

export type Profile = {
  nodes: Node[];
  samples: number[];
  timeDeltas: number[];
  startTime: number;
  endTime: number;
};

export type TimedNode = Node & {
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

export type TStat = {
  confidenceInterval: number[];
  tScore: number;
  pValue: number;
  degreesFreedom: number;
  alpha: number;
};

export type FunctionTStat = {
  functionName: string;
  url: string;
  cumulativeTimeTStat: TStat;
};

export type ProfileTStat = {
  cumulativeTimeTStat: TStat;
  functionTStats: FunctionTStat[];
  dropped: FunctionTiming[];
  added: FunctionTiming[];
};

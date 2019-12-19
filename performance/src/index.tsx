import { existsSync, mkdirSync, readdirSync, unlinkSync } from "fs";
import { Box, render } from "ink";
import { join } from "path";
import * as React from "react";
import { Profile, Timing, TStat } from "./components";

const directory = join(__dirname, "..", "profiles");

function isPerformanceFile(name: string) {
  return (
    name.endsWith(".cpuprofile") ||
    name.endsWith("-tstats.json") ||
    name === "timing.json"
  );
}

function prepareDir(name: string, baseline: string) {
  let workingDir = join(directory, name, baseline);
  if (!existsSync(workingDir)) {
    mkdirSync(workingDir, { recursive: true });
  } else {
    let files = readdirSync(workingDir).filter(isPerformanceFile);

    for (const file of files) {
      unlinkSync(join(workingDir, file));
    }
  }
}

interface TestSuite<T> {
  name: string;
  runner: (test: T) => void;
  cases: T[];
}

interface ProfileOptions {
  baseline: string;
  runs: number;
}

export function suite<T>(testSuite: TestSuite<T>) {
  return testSuite;
}

export function profile<T>(
  { name, runner, cases }: TestSuite<T>,
  { baseline, runs }: ProfileOptions
) {
  prepareDir(name, baseline);

  return new Promise(resolve => {
    const profileRunner = render(
      <Box>
        <Profile
          name={name}
          baseline={baseline}
          run={runner}
          cases={cases}
          runs={runs}
          directory={directory}
          done={() => {
            profileRunner.unmount();
            resolve();
          }}
        ></Profile>
      </Box>
    );
  }).then(() => calculateTiming(name, baseline));
}

export function calculateTiming(name: string, baseline: string) {
  return new Promise(resolve => {
    const timingRunner = render(
      <Box>
        <Timing
          name={name}
          baseline={baseline}
          directory={directory}
          done={() => {
            timingRunner.unmount();
            resolve();
          }}
        ></Timing>
      </Box>
    );
  });
}

export function calculateTStat(
  name: string,
  baseline: string,
  current: string
) {
  return new Promise(resolve => {
    const tStatRunner = render(
      <Box>
        <TStat
          name={name}
          baseline={baseline}
          current={current}
          directory={directory}
          done={() => {
            tStatRunner.unmount();
            resolve();
          }}
        ></TStat>
      </Box>
    );
  });
}

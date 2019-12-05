import { existsSync, mkdirSync, writeFileSync } from "fs";
import { Box, Color, Text } from "ink";
import * as inspector from "inspector";
import { join } from "path";
import * as React from "react";
import { FC, useEffect, useState } from "react";
import { shuffle, enable, testId, run } from "../utils";
import { useTask } from "../hooks";

function factorial(n: number): number {
  if (n === 1) {
    return 1;
  }

  return n * factorial(n - 1);
}

function generateCases<T>(cases: T[], times: number) {
  let runs: { [key: string]: T[] } = {};
  let count = Math.min(factorial(cases.length), times);

  while (count--) {
    let shuffledCases = shuffle(cases);
    while (runs[testId(shuffledCases, cases)]) {
      shuffledCases = shuffle(cases);
    }
    runs[testId(shuffledCases, cases)] = shuffledCases;
  }
  return runs;
}

export const Profile: FC<{
  name: string;
  cases: any[];
  run: (testCase: any) => void;
  done: () => void;
  directory: string;
  runs: number;
}> = props => {
  const [session] = useState(new inspector.Session());
  const [runs] = useState(generateCases(props.cases, props.runs));

  const [{ isRunning, completed }, runProfile] = useTask(
    function*(id: string, cases: any) {
      let profile = yield run(session, () => {
        for (let i = 0, len = cases.length; i < len; i++) {
          props.run(cases[i]);
        }
      });
      if (profile) {
        writeFileSync(
          join(props.directory, props.name, `${id}.cpuprofile`),
          JSON.stringify(profile)
        );
      }
      return id;
    },
    { strategy: "queue", maxConcurrency: 1 }
  );

  const profiles = completed.map(task => task.value);

  useEffect(() => {
    session.connect();

    if (!existsSync(join(props.directory, props.name))) {
      mkdirSync(join(props.directory, props.name));
    }

    enable(session).then(() => {
      Object.keys(runs).forEach(key => {
        runProfile(key, runs[key]);
      });
    });
  }, [props.directory, props.name, props.cases, props.runs]);

  const isFinished = !isRunning && profiles.length > 0;
  if (isFinished) {
    setTimeout(() => {
      session.disconnect();
      props.done();
    }, 10);
  }

  return (
    <Box flexDirection="column">
      <Box>
        {isFinished && (
          <>
            <Color bgKeyword="green">
              <Text bold> DONE </Text>
            </Color>{" "}
            {props.name}
          </>
        )}
        {isRunning && (
          <>
            <Color black bgKeyword="yellow">
              <Text bold> RUNNING </Text>
            </Color>{" "}
            {props.name} ({profiles.length + 1}/{props.runs})
          </>
        )}
      </Box>
      <Box flexDirection="column">
        {profiles.map(profile => (
          <Box key={profile} height={1} paddingLeft={2}>
            <Color hex="#8B8B8B">performance/profiles/{props.name}/</Color>
            {profile}
            <Color hex="#8B8B8B">.cpuprofile</Color>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

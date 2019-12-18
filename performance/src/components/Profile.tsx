import { Box, Color, Text } from "ink";
import { join, relative } from "path";
import * as React from "react";
import { FC, useEffect, useState } from "react";
import { generateCases, generateProfile } from "../lib/generate-profiles";
import { useTask } from "../hooks";

export const Profile: FC<{
  name: string;
  cases: any[];
  run: (testCase: any) => void;
  done: () => void;
  directory: string;
  baseline: string;
  runs: number;
}> = props => {
  const [workingDir] = useState(
    join(props.directory, props.name, props.baseline)
  );
  const [relativePath] = useState(
    relative(join(__dirname, "../../.."), workingDir)
  );
  const [runs] = useState(generateCases(props.cases, props.runs));

  const [{ isRunning, completed }, runProfile] = useTask(
    function*(key) {
      yield generateProfile(key, runs[key], workingDir, props.run);
    },
    {
      strategy: "queue",
      maxConcurrency: 1
    }
  );

  const profiles = completed.map(task => task.value);

  useEffect(() => {
    Object.keys(runs).forEach(key => {
      runProfile(key);
    });
  }, [props.directory, props.name, props.cases, props.runs]);

  const isFinished = !isRunning && profiles.length > 0;
  if (isFinished) {
    setTimeout(() => {
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
            <Color hex="#8B8B8B">{relativePath}/</Color>
            {profile}
            <Color hex="#8B8B8B">.cpuprofile</Color>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

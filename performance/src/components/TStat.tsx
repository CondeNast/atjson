import { Box, Color, Text } from "ink";
import { join, relative } from "path";
import * as React from "react";
import { FC, useEffect, useState } from "react";
import { useTask } from "../hooks";
import { generateTStats, ProfileTStat } from "../lib/generate-tstats";

export const TStat: FC<{
  name: string;
  baseline: string;
  current: string;
  done: () => void;
  directory: string;
}> = props => {
  const [testDir] = useState(join(props.directory, props.name));
  const [relativePath] = useState(
    relative(join(__dirname, "../../.."), testDir)
  );

  const [{ isRunning, completed }, runTiming] = useTask(
    function*() {
      yield generateTStats(testDir, props.baseline, props.current);
    },
    { strategy: "queue", maxConcurrency: 1 }
  );

  const tStats =
    completed[0] && (completed[0].value as ProfileTStat | undefined);

  useEffect(() => {
    runTiming();
  }, [props.directory, props.name]);

  const isFinished = !isRunning;
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
            Comparing {props.name}: {props.current} against {props.baseline}
          </>
        )}
        {isRunning && (
          <>
            <Color black bgKeyword="yellow">
              <Text bold> RUNNING </Text>
            </Color>{" "}
            Comparing {props.name}: {props.current} against {props.baseline}
          </>
        )}
      </Box>
      {tStats && (
        <>
          <Box flexDirection="column">
            Changes:
            <Box height={1} paddingLeft={2}>
              <Color hex="#8B8B8B">
                {relativePath}/{props.current}
              </Color>
              {tStats.functionTStats.forEach(functionTStat => (
                <Box>
                  <Color
                    hex={
                      functionTStat.cumulativeTimeTStat.confidenceInterval[0] <
                      0
                        ? "#00ff00"
                        : "#ff0000"
                    }
                  >
                    <Text>
                      {functionTStat.functionName} - {functionTStat.url}
                    </Text>
                  </Color>
                  Time: {functionTStat.after.cumulativeTime.mean}{" "}
                  {functionTStat.cumulativeTimeTStat.confidenceInterval}
                </Box>
              ))}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

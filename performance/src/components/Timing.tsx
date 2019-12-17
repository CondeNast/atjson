import { Box, Color, Text } from "ink";
import { join, relative } from "path";
import * as React from "react";
import { FC, useEffect, useState } from "react";
import { useTask } from "../hooks";
import { generateTiming, TIMING_FILE } from "../lib/generate-timing";

export const Timing: FC<{
  name: string;
  baseline: string;
  done: () => void;
  directory: string;
}> = props => {
  const [workingDir] = useState(
    join(props.directory, props.name, props.baseline)
  );
  const [relativePath] = useState(
    relative(join(__dirname, "../../.."), workingDir)
  );
  const [{ isRunning, completed }, runTiming] = useTask(
    function*() {
      yield generateTiming(workingDir);
    },
    { strategy: "queue", maxConcurrency: 1 }
  );

  const profileStats = completed.map(task => task.value);

  useEffect(() => {
    runTiming();
  }, [props.directory, props.name]);

  const isFinished = !isRunning && profileStats.length > 0;
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
            Timing {props.name}
          </>
        )}
        {isRunning && (
          <>
            <Color black bgKeyword="yellow">
              <Text bold> RUNNING </Text>
            </Color>{" "}
            Timing {props.name}
          </>
        )}
      </Box>
      <Box flexDirection="column">
        <Box height={1} paddingLeft={2}>
          <Color hex="#8B8B8B">{relativePath}/</Color>
          {TIMING_FILE}
        </Box>
      </Box>
    </Box>
  );
};

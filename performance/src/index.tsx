import { existsSync, mkdirSync } from "fs";
import { Box, render } from "ink";
import { join } from "path";
import * as React from "react";
import { Profile } from "./components";

export function profile<T>(
  name: string,
  runner: (test: T) => void,
  cases: T[],
  runs = 10
) {
  if (!existsSync(join(__dirname, "..", "profiles"))) {
    mkdirSync(join(__dirname, "..", "profiles"));
  }

  return new Promise(resolve => {
    const app = render(
      <Box>
        <Profile
          name={name}
          run={runner}
          cases={cases}
          runs={runs}
          directory={join(__dirname, "..", "profiles")}
          done={() => {
            app.unmount();
            resolve();
          }}
        ></Profile>
      </Box>
    );
  });
}

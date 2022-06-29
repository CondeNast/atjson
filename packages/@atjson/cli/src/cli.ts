#!/usr/bin/env node
import minimist from "minimist";
import { generateTypes } from "./commands/generate-types";
import { validate } from "./commands/validate";

let args = minimist(process.argv.slice(2));

if (args._[0] === "generate-types") {
  if (
    typeof args._[1] === "string" &&
    typeof args.out === "string" &&
    (args.format === "javascript" || args.format === "typescript")
  ) {
    generateTypes({
      path: args._[1],
      out: args.out,
      format: args.format as "javascript" | "typescript",
      dryRun: "d" in args || "dry" in args,
    }).then(() => {
      process.exit();
    });
  }
} else if (args._[0] === "validate") {
  if (typeof args._[1] === "string") {
    validate({
      path: args._[1],
    }).then(() => {
      process.exit();
    });
  }
}

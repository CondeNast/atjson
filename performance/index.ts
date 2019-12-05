/* eslint-env node */
import * as spec from "commonmark-spec";
import { profile } from "./src";
import CommonMarkSource from "@atjson/source-commonmark";
import CommonMarkRenderer from "@atjson/renderer-commonmark";
import OffsetSource from "@atjson/offset-annotations";

async function run() {
  await profile(
    "commonmark-spec",
    test => {
      CommonMarkRenderer.render(
        CommonMarkSource.fromRaw(test.markdown).convertTo(OffsetSource)
      );
    },
    spec.tests
  );
}

run().then(
  () => {
    process.exit();
  },
  err => {
    throw Error(err);
  }
);

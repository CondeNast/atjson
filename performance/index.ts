/* eslint-env node */
import * as spec from "commonmark-spec";
import { profile } from "./src";
import CommonMarkSource from "@atjson/source-commonmark";
import CommonMarkRenderer from "@atjson/renderer-commonmark";
import OffsetSource from "@atjson/offset-annotations";
import { readdirSync, readFileSync } from "fs";
import * as minimist from "minimist";
import { join } from "path";

async function run() {
  const args = minimist(process.argv.slice(2), {
    string: ["baseline", "times"]
  });
  const times = Number(args.times) || 10;
  const baseline =
    args.baseline || args.baseline === "" ? "baseline" : "current";

  await profile(
    "commonmark-spec",
    baseline,
    test => {
      CommonMarkRenderer.render(
        CommonMarkSource.fromRaw(test.markdown).convertTo(OffsetSource)
      );
    },
    spec.tests,
    times
  );

  await profile(
    "commonmark-spec equality",
    baseline,
    test => {
      let doc = CommonMarkSource.fromRaw(test.markdown);
      let md = CommonMarkRenderer.render(doc.convertTo(OffsetSource));
      doc.equals(CommonMarkSource.fromRaw(md));
    },
    spec.tests,
    times
  );

  await profile(
    "degenerate-markdown",
    baseline,
    markdown => {
      CommonMarkRenderer.render(
        CommonMarkSource.fromRaw(markdown).convertTo(OffsetSource)
      );
    },
    readdirSync(join(__dirname, "fixtures")).map(filename =>
      readFileSync(join(__dirname, "fixtures", filename)).toString()
    ),
    times
  );

  await profile(
    "degenerate-markdown equality",
    baseline,
    markdown => {
      let doc = CommonMarkSource.fromRaw(markdown);
      let md = CommonMarkRenderer.render(doc.convertTo(OffsetSource));
      doc.equals(CommonMarkSource.fromRaw(md));
    },
    readdirSync(join(__dirname, "fixtures")).map(filename =>
      readFileSync(join(__dirname, "fixtures", filename)).toString()
    ),
    times
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

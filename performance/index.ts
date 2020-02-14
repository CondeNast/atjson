/* eslint-env node */
import * as spec from "commonmark-spec";
import { profile, suite } from "./src";
import { md } from "./fixtures";
import CommonMarkSource from "@atjson/source-commonmark";
import CommonMarkRenderer from "@atjson/renderer-commonmark";
import OffsetSource from "@atjson/schema-offset";
import * as minimist from "minimist";

const TestSuites = [
  suite({
    name: "commonmark-spec",
    cases: spec.tests,
    runner: test => {
      CommonMarkRenderer.render(
        CommonMarkSource.fromRaw(test.markdown).convertTo(OffsetSource)
      );
    }
  }),
  suite({
    name: "commonmark-spec equality",
    cases: spec.tests,
    runner: test => {
      let doc = CommonMarkSource.fromRaw(test.markdown);
      let md = CommonMarkRenderer.render(doc.convertTo(OffsetSource));
      doc.equals(CommonMarkSource.fromRaw(md));
    }
  }),
  suite({
    name: "degenerate-markdown",
    cases: md,
    runner: markdown => {
      CommonMarkRenderer.render(
        CommonMarkSource.fromRaw(markdown).convertTo(OffsetSource)
      );
    }
  }),
  suite({
    name: "degenerate-markdown equality",
    cases: md,
    runner: markdown => {
      let doc = CommonMarkSource.fromRaw(markdown);
      let md = CommonMarkRenderer.render(doc.convertTo(OffsetSource));
      doc.equals(CommonMarkSource.fromRaw(md));
    }
  })
];

async function run() {
  const args = minimist(process.argv.slice(2), {
    string: ["baseline", "times"]
  });
  const options = {
    runs: Number(args.times) || 10,
    baseline: args.baseline || args.baseline === "" ? "baseline" : "current"
  };

  for (let suite of TestSuites) {
    await profile<any>(suite, options);
  }
}

run().then(
  () => {
    process.exit();
  },
  err => {
    throw Error(err);
  }
);

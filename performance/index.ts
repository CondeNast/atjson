/* eslint-env node */
import * as spec from "commonmark-spec";
import { profile } from "./src";
import CommonMarkSource from "@atjson/source-commonmark";
import CommonMarkRenderer from "@atjson/renderer-commonmark";
import OffsetSource from "@atjson/offset-annotations";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

async function run() {
  const baselineOptionIndex = process.argv.indexOf("--baseline");
  const baseline =
    (baselineOptionIndex > -1 && process.argv[baselineOptionIndex + 1]) ||
    "current";

  await profile(
    "commonmark-spec",
    baseline,
    test => {
      CommonMarkRenderer.render(
        CommonMarkSource.fromRaw(test.markdown).convertTo(OffsetSource)
      );
    },
    spec.tests
  );

  await profile(
    "commonmark-spec equality",
    baseline,
    test => {
      let doc = CommonMarkSource.fromRaw(test.markdown);
      let md = CommonMarkRenderer.render(doc.convertTo(OffsetSource));
      doc.equals(CommonMarkSource.fromRaw(md));
    },
    spec.tests
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
    )
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
    )
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

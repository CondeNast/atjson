/* eslint-env node */
import * as spec from "commonmark-spec";
import { profile } from "./src";
import { summarize } from "./src/lib";
import CommonMarkSource from "@atjson/source-commonmark";
import CommonMarkRenderer from "@atjson/renderer-commonmark";
import OffsetSource from "@atjson/offset-annotations";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

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

  await profile(
    "commonmark-spec equality",
    test => {
      let doc = CommonMarkSource.fromRaw(test.markdown);
      let md = CommonMarkRenderer.render(doc.convertTo(OffsetSource));
      doc.equals(CommonMarkSource.fromRaw(md));
    },
    spec.tests
  );

  await profile(
    "degenerate-markdown",
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
    markdown => {
      let doc = CommonMarkSource.fromRaw(markdown);
      let md = CommonMarkRenderer.render(doc.convertTo(OffsetSource));
      doc.equals(CommonMarkSource.fromRaw(md));
    },
    readdirSync(join(__dirname, "fixtures")).map(filename =>
      readFileSync(join(__dirname, "fixtures", filename)).toString()
    )
  );

  await summarize("commonmark-spec");
  await summarize("commonmark-spec equality");
  await summarize("degenerate-markdown");
  await summarize("degenerate-markdown equality");
}

run().then(
  () => {
    process.exit();
  },
  err => {
    throw Error(err);
  }
);

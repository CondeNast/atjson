/* eslint-env node */
import * as spec from "commonmark-spec";
import { run } from "@condenast/perf-kit";
import { md } from "./fixtures";
import CommonMarkSource from "@atjson/source-commonmark";
import CommonMarkRenderer from "@atjson/renderer-commonmark";
import OffsetSource from "@atjson/offset-annotations";

run<any>(
  {
    name: "Commonmark Spec",
    cases: spec.tests,
    runner: (test) => {
      CommonMarkRenderer.render(
        CommonMarkSource.fromRaw(test.markdown).convertTo(OffsetSource)
      );
    },
  },
  {
    name: "Commonmark Spec Equality",
    cases: spec.tests,
    runner: (test) => {
      let doc = CommonMarkSource.fromRaw(test.markdown);
      let md = CommonMarkRenderer.render(doc.convertTo(OffsetSource));
      doc.equals(CommonMarkSource.fromRaw(md));
    },
  },
  {
    name: "Degenerate Markdown",
    cases: md,
    runner: (markdown) => {
      CommonMarkRenderer.render(
        CommonMarkSource.fromRaw(markdown).convertTo(OffsetSource)
      );
    },
  },
  {
    name: "Degenerate Markdown Equality",
    cases: md,
    runner: (markdown) => {
      let doc = CommonMarkSource.fromRaw(markdown);
      let md = CommonMarkRenderer.render(doc.convertTo(OffsetSource));
      doc.equals(CommonMarkSource.fromRaw(md));
    },
  }
);

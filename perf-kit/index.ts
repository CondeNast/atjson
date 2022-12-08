/* eslint-env node */
import * as spec from "commonmark-spec";
import { run } from "@condenast/perf-kit";
import { md, html } from "./fixtures";
import CommonMarkSource from "@atjson/source-commonmark";
import CommonMarkRenderer from "@atjson/renderer-commonmark";
import HTMLSource from "@atjson/source-html";
import HTMLRenderer from "@atjson/renderer-html";
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
  },
  {
    name: "HTML",
    cases: html,
    runner: (text) => {
      HTMLRenderer.render(HTMLSource.fromRaw(text).convertTo(OffsetSource));
    },
  },
  {
    name: "HTML Equality",
    cases: html,
    runner: (text) => {
      let doc = HTMLSource.fromRaw(text);
      let html = HTMLRenderer.render(doc.convertTo(OffsetSource));
      doc.equals(HTMLSource.fromRaw(html));
    },
  }
);

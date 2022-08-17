/**
 * @jest-environment node
 */
import { HIR } from "@atjson/hir";
import OffsetSource from "@atjson/offset-annotations";
import CommonMarkSource from "@atjson/source-commonmark";
import * as spec from "commonmark-spec";
import MarkdownIt from "markdown-it";
import CommonMarkRenderer from "../src/index";

const skippedTests = [
  142, // Additional newline after HTML block
  303, // Whitespace in code is stripped by markdown-it
  326, // This test has an HTML entity at the start of a paragraph, which we strip
  331, // Whitespace in code is stripped by markdown-it
];

const unitTestsBySection: {
  [moduleName: string]: Array<{
    markdown: string;
    html: string;
    section: string;
    number: number;
  }>;
} = {};

spec.tests.reduce((modules, unitTest) => {
  if (!modules[unitTest.section]) modules[unitTest.section] = [];
  modules[unitTest.section].push(unitTest);
  return modules;
}, unitTestsBySection);

Object.keys(unitTestsBySection).forEach((moduleName) => {
  const unitTests = unitTestsBySection[moduleName];

  describe(moduleName, () => {
    unitTests.forEach((unitTest) => {
      let shouldSkip = skippedTests.indexOf(unitTest.number) !== -1;

      (shouldSkip ? test.skip : test)(unitTest.markdown, () => {
        let markdown = unitTest.markdown.replace(/→/g, "\t");
        let original = CommonMarkSource.fromRaw(markdown);
        let generatedMarkdown = CommonMarkRenderer.render(
          original.convertTo(OffsetSource)
        );
        let output = CommonMarkSource.fromRaw(generatedMarkdown);

        // Assert that our internal representations (AtJSON) match
        let originalHIR = new HIR(original.withStableIds());
        let outputHIR = new HIR(output.withStableIds());
        originalHIR.rootNode.id = "00000000";
        outputHIR.rootNode.id = "00000000";
        expect(originalHIR.toJSON()).toMatchSnapshot();
        expect(outputHIR.toJSON()).toMatchSnapshot();
        expect(outputHIR.toJSON()).toEqual(originalHIR.toJSON());

        // Assert that external representations (HTML) match
        let md = MarkdownIt("commonmark");
        expect(md.render(generatedMarkdown)).toEqual(md.render(markdown));
      });
    });
  });
});

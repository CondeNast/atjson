/**
 * @jest-environment node
 */
import { HIR } from '@atjson/hir';
import OffsetSource from '@atjson/offset-annotations';
import CommonMarkSource from '@atjson/source-commonmark';
import * as spec from 'commonmark-spec';
import * as MarkdownIt from 'markdown-it';
import CommonMarkRenderer from '../src/index';

const skippedTests = [
  140, // Additional newline in HTML block
  491  // Alt text that is never used
];

const unitTestsBySection: { [moduleName: string]: spec.tests } = spec.tests.reduce((modules, unitTest) => {
  if (!modules[unitTest.section]) modules[unitTest.section] = [];
  modules[unitTest.section].push(unitTest);
  return modules;
}, {});

Object.keys(unitTestsBySection).forEach(moduleName => {
  const unitTests = unitTestsBySection[moduleName];

  describe(moduleName, () => {
    unitTests.forEach(unitTest => {
      let shouldSkip = skippedTests.indexOf(unitTest.number) !== -1;

      (shouldSkip ? test.skip : test)(unitTest.markdown, () => {
        let markdown = unitTest.markdown.replace(/→/g, '\t');
        let original = CommonMarkSource.fromRaw(markdown);
        let generatedMarkdown = CommonMarkRenderer.render(original.convertTo(OffsetSource));
        let output = CommonMarkSource.fromRaw(generatedMarkdown);

        // Assert that our internal representations (AtJSON) match
        let originalHIR = new HIR(original).toJSON();
        let outputHIR = new HIR(output).toJSON();
        expect(originalHIR).toMatchSnapshot();
        expect(outputHIR).toMatchSnapshot();
        expect(outputHIR).toEqual(originalHIR);

        // Assert that external representations (HTML) match
        let md = MarkdownIt('commonmark');
        expect(md.render(generatedMarkdown)).toEqual(md.render(markdown));
      });
    });
  });
});

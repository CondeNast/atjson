/**
 * @jest-environment node
 */
import { HIR } from '@atjson/hir';
import CommonMarkSource from '@atjson/source-commonmark';
import * as spec from 'commonmark-spec';
import * as MarkdownIt from 'markdown-it';
import CommonMarkRenderer from '../src/index';

const skippedTests = [
  140, // Additional newline in HTML block
  491  // Alt text that is never used
];

const testModules = spec.tests.reduce((modules: any, test: any) => {
  if (!modules[test.section]) modules[test.section] = [];
  modules[test.section].push(test);
  return modules;
}, {});

Object.keys(testModules).forEach(moduleName => {
  const moduleTests = testModules[moduleName];

  describe(moduleName, () => {
    moduleTests.forEach((test: any): void => {
      let shouldSkip = skippedTests.indexOf(test.number) !== -1;
      let renderer = new CommonMarkRenderer();

      (shouldSkip ? xit : it)(test.markdown, () => {
        let markdown = test.markdown.replace(/→/g, '\t');
        let original = new CommonMarkSource(markdown);
        let generatedMarkdown = renderer.render(original.toCommonSchema());
        let output = new CommonMarkSource(generatedMarkdown);

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

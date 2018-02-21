/**
 * @jest-environment node
 */
import Document from '@atjson/document';
import { HIR } from '@atjson/hir';
import CommonMarkRenderer from '@atjson/renderer-commonmark';
import CommonMarkSource from '@atjson/source-commonmark';
import * as MarkdownIt from 'markdown-it';
import * as spec from 'commonmark-spec';
import schema from './schema';

const skippedTests = [
  140, // Additional newline in HTML block
  491  // Alt text that is never used
];

const testModules = spec.tests.reduce((modules: any, test: any) => {
  if (!modules[test.section]) modules[test.section] = [];
  modules[test.section].push(test);
  return modules;
}, {});

function translate(document) {
  let doc = new Document({
    content: document.content,
    contentType: document.contentType,
    annotations: [...document.annotations],
    schema
  });

  doc.where({ type: 'em' }).set({ type: 'italic' });
  doc.where({ type: 'strong' }).set({ type: 'bold' });
  doc.where({ type: 'hr' }).set({ type: 'horizontal-rule' });
  doc.where({ type: 'list_item' }).set({ type: 'list-item' });
  doc.where({ type: 'bullet_list' }).set({ type: 'unordered-list' });
  doc.where({ type: 'ordered_list' }).set({ type: 'ordered-list' });
  doc.where({ type: 'hardbreak' }).set({ type: 'line-break' });
  doc.where({ type: 'code_inline' }).set({ type: 'code', attributes: { style: 'inline' } });
  doc.where({ type: 'code_block' }).set({ type: 'code', attributes: { style: 'block' } });
  doc.where({ type: 'fence' }).set({ type: 'code', attributes: { style: 'fence' } });
  doc.where({ type: 'image' }).map({ attributes: { src: 'url' } });
  doc.where({ type: 'html_inline' }).set({ type: 'html', attributes: { type: 'inline' } });
  doc.where({ type: 'html_block' }).set({ type: 'html', attributes: { type: 'block' } });

  return doc;
}

Object.keys(testModules).forEach(moduleName => {
  const moduleTests = testModules[moduleName];

  describe(moduleName, () => {
    moduleTests.forEach((test: any): void => {
      let shouldSkip = skippedTests.includes(test.number);
      let renderer = new CommonMarkRenderer();

      (shouldSkip ? xit : it)(test.markdown, () => {
        let markdown = test.markdown.replace(/→/g, '\t');
        let original = new CommonMarkSource(markdown);
        let generatedMarkdown = renderer.render(translate(original));
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

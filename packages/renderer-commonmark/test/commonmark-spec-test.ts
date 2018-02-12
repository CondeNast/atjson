/**
 * @jest-environment node
 */
import Document from '@atjson/document';
import { HIR } from '@atjson/hir';
import CommonMarkRenderer from '@atjson/renderer-commonmark';
import CommonMarkSource from '@atjson/source-commonmark';
import * as spec from 'commonmark-spec';
import schema from './schema';

const skippedTests = [
  181, // missing whitespace
  202, // newline removed
  203  // ambiguous newline location
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

  doc.where({ type: 'a' }).set({ type: 'link' });
  doc.where({ type: 'p' }).set({ type: 'paragraph' });
  doc.where({ type: 'h1' }).set({ type: 'heading', attributes: { level: 1 } });
  doc.where({ type: 'h2' }).set({ type: 'heading', attributes: { level: 2 } });
  doc.where({ type: 'h3' }).set({ type: 'heading', attributes: { level: 3 } });
  doc.where({ type: 'h4' }).set({ type: 'heading', attributes: { level: 4 } });
  doc.where({ type: 'h5' }).set({ type: 'heading', attributes: { level: 5 } });
  doc.where({ type: 'h6' }).set({ type: 'heading', attributes: { level: 6 } });
  doc.where({ type: 'em' }).set({ type: 'italic' });
  doc.where({ type: 'strong' }).set({ type: 'bold' });
  doc.where({ type: 'hr' }).set({ type: 'horizontal-rule' });
  doc.where({ type: 'img' }).set({ type: 'image' });
  doc.where({ type: 'li' }).set({ type: 'list-item' });
  doc.where({ type: 'ul' }).set({ type: 'unordered-list' });
  doc.where({ type: 'ol' }).set({ type: 'ordered-list' });
  doc.where({ type: 'br' }).set({ type: 'line-break' });

  return doc;
}

Object.keys(testModules).forEach(moduleName => {
  if (moduleName.match(/html/i)) return;
  const moduleTests = testModules[moduleName];

  describe(moduleName, () => {
    moduleTests.forEach((test: any): void => {
      let shouldSkip = skippedTests.includes(test.number);
      let renderer = new CommonMarkRenderer();
      (shouldSkip ? xit : it)(test.markdown, () => {
        let original = new CommonMarkSource(test.markdown.replace(/→/g, '\t'));
        let generatedMarkdown = renderer.render(translate(original));
        let output = new CommonMarkSource(generatedMarkdown);
//          console.log(test.markdown.replace(/→/g, '\t'));
//          console.log(original);
//          console.log(generatedMarkdown);

        let originalHIR = new HIR(original).toJSON();
        let outputHIR = new HIR(output).toJSON();
        expect(originalHIR).toMatchSnapshot();
        expect(outputHIR).toMatchSnapshot();

        expect(outputHIR).toEqual(originalHIR);
      });
    });
  });
});

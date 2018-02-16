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
        console.log('\u001B[45m' + test.markdown.replace(/→/g, '\t') + '\u001B[49m\n\n\u001B[44m' + generatedMarkdown + '\u001B[49m');
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

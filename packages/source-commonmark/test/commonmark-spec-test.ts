/**
 * @jest-environment node
 */
import Document from '@atjson/document';
import { HIR } from '@atjson/hir';
import CommonMarkSource from '@atjson/source-commonmark';
import HTMLSource, { schema } from '@atjson/source-html';
import * as spec from 'commonmark-spec';

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

const augmentEmbeddedHTML = mdAtJSON => {

  let embeddedHTMLAnnotations = mdAtJSON.annotations
    .filter(a => a.type === 'html' || a.type === '')
    .map(a => {
      let h = new HTMLSource(mdAtJSON.content.substr(a.start, a.end)).annotations;
      return h.map(v => {
          v.start += a.start;
          v.end += a.start;
          return v;
        });
    })
    .reduce((acc, i) => acc.concat(i), []);

  if (embeddedHTMLAnnotations.length > 0) {

    mdAtJSON.annotations = mdAtJSON.annotations
      .concat(embeddedHTMLAnnotations.filter(v => v.type !== 'parse-token'))
      .filter(v => v.type !== 'html' && v.type !== '');

    embeddedHTMLAnnotations
      .filter(v => v.type === 'parse-token')
      .forEach(v => mdAtJSON.deleteText(v));
  }

  return mdAtJSON;
};

let annotationNames = new Set();
Object.keys(testModules).forEach(moduleName => {

  if (moduleName.match(/html/i)) return;
  const moduleTests = testModules[moduleName];

  describe(moduleName, () => {
    moduleTests.forEach((test: any): void => {
      let shouldSkip = skippedTests.includes(test.number);
      (shouldSkip ? xit : it)('\n\n--- markdown --->' + test.markdown + '<---\n--- html --->' + test.html + '<---\n\n', () => {
        test.markdown = test.markdown.replace(/→/g, '\t');
        test.html = test.html.replace(/→/g, '\t');

        let mdAtJSON = new CommonMarkSource(test.markdown);
        let htmlAtJSON = new HTMLSource(test.html);

        mdAtJSON = augmentEmbeddedHTML(mdAtJSON);

        let markdownHIR = new HIR(mdAtJSON).toJSON();
        let htmlHIR = new HIR(htmlAtJSON).toJSON();
        expect(markdownHIR).toMatchSnapshot();
        expect(htmlHIR).toMatchSnapshot();

        expect(markdownHIR).toEqual(htmlHIR);
      });
    });
  });
});

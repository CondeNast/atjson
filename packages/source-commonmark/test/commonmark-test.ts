/**
 * @jest-environment node
 */
import Document from '@atjson/document';
import { HIR } from '@atjson/hir';
import CommonMarkSource from '@atjson/source-commonmark';
import HTMLSource from '@atjson/source-html';
import * as spec from 'commonmark-spec';
import process from 'process';

const skippedTests = [
  107, // ambiguous paragraph nesting
  181, // missing whitespace
  202, // newline removed
  203, // ambiguous newline location
  271, // additional newline added
  272, // additional newline added
  298, // additional newline added
  308, // additional newline added
  325, // unclosed HTML fragment
  388, // duplicate italic annotation added
  403, // duplicate bold annotation added
  453, // incorrect HTML annotation; includes nested link annotations
  454, // incorrect HTML annotation; includes nested link annotations
  466, // incorrect HTML annotation; implicitly closed tag has an additional annotation
  495, // ambiguous nesting with unclosed HTML
  507, // ambiguous nesting with unclosed HTML
  558, // unwrapped image in a paragraph
  614, // unclosed HTML element
  615  // unclosed HTML element
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
      let p = new HTMLSource(mdAtJSON.content.substr(a.start, a.end));
      let h = p.parse();
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

Object.keys(testModules).forEach(moduleName => {

  if (moduleName.match(/html/i)) return;
  const moduleTests = testModules[moduleName];

  describe(moduleName, () => {
    moduleTests.forEach((test: any): void => {
      let shouldSkip = skippedTests.includes(test.number);
      (shouldSkip ? xit : it)('\n\n--- markdown --->' + test.markdown + '<---\n--- html --->' + test.html + '<---\n\n', () => {
        test.markdown = test.markdown.replace(/→/g, '\t');
        test.html = test.html.replace(/→/g, '\t');

        let parser = new CommonMarkSource(test.markdown);
        let htmlParser = new HTMLSource(test.html);

        let parsedMarkdown = parser.toAtJSON();
        let parsedHtml = htmlParser.parse();

        let mdAtJSON = new Document({
          content: parsedMarkdown.content,
          contentType: 'text/commonmark',
          annotations: parsedMarkdown.annotations
        });

        mdAtJSON = augmentEmbeddedHTML(mdAtJSON);

        let htmlAtJSON = new Document({
          content: test.html,
          contentType: 'text/html',
          annotations: parsedHtml
        });

        //expect(htmlAtJSON.annotations).toEqual(mdAtJSON.annotations);
        //expect(htmlAtJSON.content).toEqual(mdAtJSON.content);

        let markdownHIR = new HIR(mdAtJSON).toJSON();
        let htmlHIR = new HIR(htmlAtJSON).toJSON();

        expect(markdownHIR).toEqual(htmlHIR);
      });
    });
  });
});

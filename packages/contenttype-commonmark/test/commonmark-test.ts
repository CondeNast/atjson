/**
 * @jest-environment node
 */
import { Parser as HTMLParser } from '@atjson/contenttype-html';
import { Parser } from '@atjson/contenttype-commonmark';
import { AtJSON } from '@atjson/core';
import { HIR } from '@atjson/hir';
import process from 'process';
import * as spec from 'commonmark-spec';

const testModules = spec.tests.reduce((modules: any, test: any) => {
  if (!modules[test.section]) modules[test.section] = [];
  modules[test.section].push(test);
  return modules;
}, {});

const augmentEmbeddedHTML = (mdAtJSON) => {

  let embeddedHTMLAnnotations = mdAtJSON.annotations
    .filter(a => a.type === 'html' || a.type === '')
    .map(a => {
      let p = new HTMLParser(mdAtJSON.content.substr(a.start, a.end));
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
      .forEach(v => mdAtJSON.deleteText(v))
  }

  return mdAtJSON;
}

Object.keys(testModules).forEach(moduleName => {

  if (moduleName.match(/html/i)) return;
  const moduleTests = testModules[moduleName];

  describe(moduleName, function() {
    moduleTests.forEach((test: any): void => {
      it('\n\n--- markdown --->' + test.markdown + '<---\n--- html --->' + test.html + '<---\n\n', function () {
        test.markdown = test.markdown.replace(/→/g, '\t');
        test.html = test.html.replace(/→/g, '\t');

        let parser = new Parser(test.markdown);
        let htmlParser = new HTMLParser(test.html);

        let parsedMarkdown = parser.parse();
        let parsedHtml = htmlParser.parse();

        let mdAtJSON = new AtJSON({
          content: parsedMarkdown.content,
          contentType: 'text/commonmark',
          annotations: parsedMarkdown.annotations
        });

        mdAtJSON = augmentEmbeddedHTML(mdAtJSON);

        let htmlAtJSON = new AtJSON({
          content: test.html,
          contentType: 'text/html',
          annotations: parsedHtml
        });

        let markdownHIR = new HIR(mdAtJSON).toJSON();
        let htmlHIR = new HIR(htmlAtJSON).toJSON();

        expect(markdownHIR).toEqual(htmlHIR);
      });
    });
  });
});

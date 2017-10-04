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

Object.keys(testModules).forEach(moduleName => {

  if (moduleName.match(/html/i)) return;
  const moduleTests = testModules[moduleName];

  describe(module, function() {
    moduleTests.forEach((test: any): void => {
      it('\n\n--- markdown --->' + test.markdown + '<---\n--- html --->' + test.html + '<---\n\n', assert => {

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

        let htmlAtJSON = new AtJSON({
          content: test.html,
          contentType: 'text/html',
          annotations: parsedHtml
        });

        let markdownHIR = new HIR(mdAtJSON).toJSON();
        let htmlHIR = new HIR(htmlAtJSON).toJSON();

          expect(JSON.stringify(markdownHIR)).toEqual(JSON.stringify(htmlHIR));
      });
    });
  });
});

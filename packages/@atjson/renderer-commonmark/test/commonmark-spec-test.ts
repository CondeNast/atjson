/**
 * @jest-environment node
 */
import { deserialize, serialize } from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import CommonMarkSource from "@atjson/source-commonmark";
import * as spec from "commonmark-spec";
import MarkdownIt from "markdown-it";
import CommonMarkRenderer from "../src/index";

const skippedTests = [
  17, // [Whitespace in code is stripped by markdown-it](https://spec.commonmark.org/0.30/#example-17)
  40, // [We expect leading whitespace to be stripped](https://spec.commonmark.org/0.30/#example-40)
  173, // [Additional newline after HTML block](https://spec.commonmark.org/0.30/#example-173)
  331, // [Whitespace in code is stripped by markdown-it](https://spec.commonmark.org/0.30/#example-331)
];

const onlyTests: number[] = [];

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
      let shouldOnly = onlyTests.indexOf(unitTest.number) !== -1;

      (shouldOnly ? test.only : shouldSkip ? test.skip : test)(
        unitTest.markdown,
        () => {
          let markdown = unitTest.markdown.replace(/→/g, "\t");
          let original = CommonMarkSource.fromRaw(markdown);
          let generatedMarkdown = CommonMarkRenderer.render(
            original.convertTo(OffsetSource)
          );
          let output = CommonMarkSource.fromRaw(generatedMarkdown);
          let originalJSON = serialize(original, { withStableIds: true });
          let generatedJSON = serialize(output, { withStableIds: true });
          expect(originalJSON).toMatchSnapshot();
          expect(generatedJSON).toMatchSnapshot();
          expect(originalJSON).toEqual(generatedJSON);

          let deserializedOriginal = deserialize(
            originalJSON,
            CommonMarkSource
          );
          let deserializedGenerated = deserialize(
            generatedJSON,
            CommonMarkSource
          );

          // Verify serialization is working properly
          if (!deserializedOriginal.equals(deserializedGenerated)) {
            expect(
              deserializedOriginal.canonical().withStableIds().toJSON()
            ).toEqual(
              deserializedGenerated.canonical().withStableIds().toJSON()
            );
          } else {
            expect(deserializedOriginal.equals(deserializedGenerated)).toBe(
              true
            );
          }

          if (!original.equals(deserializedGenerated)) {
            expect(original.canonical().withStableIds().toJSON()).toEqual(
              deserializedGenerated.canonical().withStableIds().toJSON()
            );
          } else {
            expect(original.equals(deserializedGenerated)).toBe(true);
          }

          // Assert that external representations (HTML) match
          let md = MarkdownIt("commonmark");
          expect(md.render(generatedMarkdown)).toEqual(md.render(markdown));
        }
      );
    });
  });
});

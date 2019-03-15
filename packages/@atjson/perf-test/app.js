import OffsetSource from '@atjson/offset-annotations';
import CommonmarkSource from '@atjson/source-commonmark';
import CommonMarkRenderer from '@atjson/renderer-commonmark';
import { readFileSync } from 'fs';
import { join } from 'path';

let markdown = readFileSync(__dirname + '/inoa.md').toString();

window.run = function () {
  let original = CommonmarkSource.fromRaw(markdown);
  let converted = original.convertTo(OffsetSource);
  return CommonMarkRenderer.render(converted);
};

import { Annotation } from '@atjson/document';
import { HorizontalRule } from './schema';
import { GDocsStyleSlice } from './types';

export default function extractHorizontalRule(styles: GDocsStyleSlice[]): Annotation[] {
  let annotations: HorizontalRule[] = [];

  for (let i = 0; i < styles.length; i++) {
    let style = styles[i];

    if (style === null) continue;

    annotations.push({
      type: '-gdocs-horizontal_rule',
      start: i,
      end: i + 1,
      attributes: {}
    });
  }

  return annotations;
}

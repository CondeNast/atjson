import { AnnotationJSON } from '@atjson/document';
import { v4 as uuid } from 'uuid';
import { GDocsStyleSlice } from './types';

export default function extractHorizontalRule(styles: GDocsStyleSlice[]): AnnotationJSON[] {
  let annotations: AnnotationJSON[] = [];

  for (let i = 0; i < styles.length; i++) {
    let style = styles[i];

    if (style === null) continue;

    annotations.push({
      id: uuid(),
      type: '-gdocs-horizontal_rule',
      start: i,
      end: i + 1,
      attributes: {}
    });
  }

  return annotations;
}

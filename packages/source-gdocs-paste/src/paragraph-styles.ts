import { Annotation } from '@atjson/document';

export default function extractParagraphStyles(styles): Annotation[] {
  let lastParagraphStart = 0;
  let annotations = [];

  for (let i = 0; i < styles.length; i++) {
    let style = styles[i];

    if (style === null) continue;

    if (style['ps_hd'] !== 0) {
      annotations.push({
        type: 'ps_hd',
        level: style['ps_hd'],
        start: lastParagraphStart,
        end: i
      });
    }

    lastParagraphStart = i + 1;
  }

  return annotations;
}

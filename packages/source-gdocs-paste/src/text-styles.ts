import { Annotation } from '@atjson/document';

export default function extractTextStyles(styles): Annotation[] {
  let state = {}
  let annotations = [];

  for (let i = 0; i < styles.length; i++) {
    let style = styles[i];
    
    if (style === null) continue;

    for (let styleType of ['ts_bd', 'ts_it', 'ts_un']) {
      if (style[styleType] === true && !state[styleType]) {
        state[styleType] = { type: styleType, start: i };
      } else if (style[styleType] === false && style[styleType + '_i'] === false && state[styleType]) {
        state[styleType].end = i;
        annotations.push(state[styleType]);
        delete state[styleType];
      }
    }

  }

  return annotations;
}

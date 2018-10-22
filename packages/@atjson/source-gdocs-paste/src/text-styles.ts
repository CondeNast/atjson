import { AnnotationJSON } from '@atjson/document';
import { v4 as uuid } from 'uuid';
import { GDocsStyleSlice } from './types';

interface ParseState {
  [key: string]: AnnotationJSON;
}

export default function extractTextStyles(styles: GDocsStyleSlice[]): AnnotationJSON[] {
  let state: ParseState = {};
  let annotations: AnnotationJSON[] = [];

  for (let i = 0; i < styles.length; i++) {
    let style = styles[i];

    if (style === null) continue;

    // Handle subscript and superscript
    if (style.ts_va !== 'nor' && !state.ts_va) {
      state.ts_va = {
        id: uuid(),
        type: '-gdocs-ts_va',
        attributes: {
          '-gdocs-va': style.ts_va
        },
        start: i,
        end: -1
      };
    } else if (style.ts_va === 'nor' && style.ts_va_i === false && state.ts_va) {
      state.ts_va.end = i;
      annotations.push(state.ts_va);
      delete state.ts_va;
    }

    for (let styleType of ['ts_bd', 'ts_it', 'ts_un', 'ts_st']) {
      if (style[styleType] === true && !state[styleType]) {
        state[styleType] = {
          id: uuid(),
          type: '-gdocs-' + styleType,
          start: i,
          end: -1,
          attributes: {}
        };
      } else if (style[styleType] === false && style[styleType + '_i'] === false && state[styleType]) {
        state[styleType].end = i;
        annotations.push(state[styleType]);
        delete state[styleType];
      }
    }

  }

  return annotations;
}

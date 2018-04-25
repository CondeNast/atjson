import { Annotation } from '@atjson/document';
import { List, ListItem } from './schema';
import { GDocsStyleSlice } from './types';

export default function extractListStyles(lists: GDocsStyleSlice[]): Annotation[] {
  let lastParagraphStart = 0;
  let listAnnotations: { [key: string]: List } = {};
  let listItems: ListItem[] = [];

  for (let i = 0; i < lists.length; i++) {
    let list = lists[i];

    if (list === null) continue;
    if (list.ls_id === null) {
      lastParagraphStart = i + 1;
      continue;
    }

    if (!listAnnotations[list.ls_id]) {
      listAnnotations[list.ls_id] = {
        type: '-gdocs-list',
        start: lastParagraphStart,
        end: i,
        attributes: {
          '-gdocs-ls_id': list.ls_id
        }
      };
    } else {
      listAnnotations[list.ls_id].end = i;
    }

    listItems.push({
      type: '-gdocs-list-item',
      start: lastParagraphStart,
      end: i,
      attributes: {
        '-gdocs-ls_nest': list.ls_nest,
        '-gdocs-ls_id': list.ls_id
      }
    });

    lastParagraphStart = i + 1;
  }

  let annotations: Annotation[] = listItems;
  for (let listAnnotation in listAnnotations) {
    annotations.push(listAnnotations[listAnnotation]);
  }

  return annotations;
}

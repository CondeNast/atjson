import { AnnotationJSON } from '@atjson/document';
import { GDocsEntityMap, GDocsStyleSlice } from './types';

export default function extractListStyles(lists: GDocsStyleSlice[], entityMap: GDocsEntityMap): AnnotationJSON[] {
  let lastParagraphStart = 0;
  let listAnnotations: { [key: string]: AnnotationJSON } = {};
  let listItems: AnnotationJSON[] = [];

  for (let i = 0; i < lists.length; i++) {
    let list = lists[i];

    if (list === null) continue;
    if (list.ls_id === null) {
      lastParagraphStart = i + 1;
      continue;
    }

    if (!listAnnotations[list.ls_id]) {
      listAnnotations[list.ls_id] = {
        id: list.ls_id,
        type: '-gdocs-list',
        start: lastParagraphStart,
        end: i,
        attributes: {
          '-gdocs-ls_id': list.ls_id,
          '-gdocs-ls_b_gs': entityMap[list.ls_id].le_nb.nl_0.b_gs,
          '-gdocs-ls_b_gt': entityMap[list.ls_id].le_nb.nl_0.b_gt,
          '-gdocs-ls_b_a' : entityMap[list.ls_id].le_nb.nl_0.b_a
        }
      };
    } else {
      listAnnotations[list.ls_id].end = i;
    }

    listItems.push({
      id: `${list.ls_id}-${listItems.length}`,
      type: '-gdocs-list_item',
      start: lastParagraphStart,
      end: i,
      attributes: {
        '-gdocs-ls_nest': list.ls_nest,
        '-gdocs-ls_id': list.ls_id
      }
    });

    lastParagraphStart = i + 1;
  }

  let annotations: AnnotationJSON[] = listItems;
  for (let listAnnotation in listAnnotations) {
    annotations.push(listAnnotations[listAnnotation]);
  }

  return annotations;
}

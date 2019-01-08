import { AnnotationJSON } from '@atjson/document';
import { GDocsEntityMap, GDocsStyleSlice } from './types';

function createListAnnotation(list: GDocsStyleSlice, entityMap: GDocsEntityMap, start: number, end: number) {
  return {
    type: '-gdocs-list',
    start,
    end,
    attributes: {
      '-gdocs-ls_id': list.ls_id,
      '-gdocs-ls_b_gs': entityMap[list.ls_id].le_nb.nl_0.b_gs,
      '-gdocs-ls_b_gt': entityMap[list.ls_id].le_nb.nl_0.b_gt,
      '-gdocs-ls_b_a' : entityMap[list.ls_id].le_nb.nl_0.b_a
    }
  };
}

function createListItemAnnotation(list: GDocsStyleSlice, start: number, end: number) {
  return {
    type: '-gdocs-list_item',
    start: start,
    end: end,
    attributes: {
      '-gdocs-ls_nest': list.ls_nest,
      '-gdocs-ls_id': list.ls_id
    }
  };
}

export default function extractListStyles(lists: GDocsStyleSlice[], entityMap: GDocsEntityMap, trailing?: GDocsStyleSlice, text?: string): AnnotationJSON[] {
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

    if (listAnnotations[list.ls_id]) {
      listAnnotations[list.ls_id].end = i;
    } else {
      listAnnotations[list.ls_id] = createListAnnotation(list, entityMap, lastParagraphStart, i);
    }

    listItems.push(createListItemAnnotation(list, lastParagraphStart, i));

    lastParagraphStart = i + 1;
  }

  if (trailing && trailing.ls_id && text) {
    // if the trailing annotation has a list id, then the list
    // continues beyond the end of the last list item, and should
    // be closed at the end of the document
      if (listAnnotations[trailing.ls_id]) {
        listAnnotations[trailing.ls_id].end = text.length;
      } else {
        listAnnotations[trailing.ls_id] = createListAnnotation(trailing, entityMap, lastParagraphStart, text.length);
      }
      listItems.push(createListItemAnnotation(trailing, lastParagraphStart, text.length));
  }

  let annotations: AnnotationJSON[] = listItems;
  for (let listAnnotation in listAnnotations) {
    annotations.push(listAnnotations[listAnnotation]);
  }

  return annotations;
}

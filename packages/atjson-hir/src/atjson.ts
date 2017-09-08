import Annotation from './annotation';

export default class AtJSON {

  content: string;
  contentType?: string;
  annotations: Annotation[];

  constructor(options: { content: string, annotations?: Annotation[], contentType?: string }|string) {
    if (typeof options === 'string') {
      options = { content: options };
    }
    this.content = options.content;
    this.annotations = options.annotations || [] as Annotation[];
    this.contentType = options.contentType || 'text/plain';
  }

  addAnnotations(annotations: Annotation|Annotation[]): void {
    this.annotations = this.annotations.concat(annotations);
  }

  removeAnnotation(annotation: Annotation): Annotation|void {
    let index = this.annotations.indexOf(annotation);
    if (index > -1) {
      return this.annotations.splice(index, 1)[0];
    }
  }

  insertText(position: number, text: string) {

    if (position < 0 || position > this.content.length) throw new Error('Invalid position.');

    const length = text.length;

    const before = this.content.slice(0, position);
    const after = this.content.slice(position);
    this.content = before + text + after;

    for (let i = this.annotations.length - 1; i >= 0; i--) {
      let a = this.annotations[i];

      if (position <= a.start) a.start += length;
      if (position <= a.end) a.end += length;
    }
  }

  deleteText(annotation: Annotation) {

    // This should really not just truncate annotations, but rather tombstone
    // the modified annotations as an atjson sub-document inside the annotation
    // that's being used to delete stuff.

    const start = annotation.start;
    const end = annotation.end;
    const length = end - start;

    const before = this.content.slice(0, start);
    const after = this.content.slice(end);

    this.content = before + after;

    let deletedAnnotationIndexes: number[] = [];

    for (let i = this.annotations.length - 1; i >= 0; i--) {
      let a = this.annotations[i];

      // We're deleting after the annotation, nothing needed to be done.
      //    [   ]
      // -----------*---*--- 
      if (a.end < start) continue;

      // If the annotation is wholly *after* the deleted text, just move
      // everything.
      //           [       ]
      // --*---*-------------
      if (end <= a.start) {
        a.start -= length;
        a.end -= length;
      } else {

        if (end < a.end) {

          // Annotation spans the whole deleted text, so just truncate the end of
          // the annotation (shrink from the right).
          //   [             ]
          // ------*------*---------
          if (start > a.start) {
            a.end -= length;

          // Annotation occurs within the deleted text, affecting both start and
          // end of the annotation, but by only part of the deleted text length.
          //         [         ]
          // ---*---------*------------
          } else if (start <= a.start) {
            a.start -= a.start - start;
            a.end -= length;
          }

        } else if (end >= a.end) {

          //             [  ]
          //          [     ]
          //          [         ]
          //              [     ]
          //    ------*---------*--------
          if (start <= a.start) {
            deletedAnnotationIndexes.push(i);

          //       [        ]
          //    ------*---------*--------
          } else if (start > a.start) {
            a.end = start;
          }

        }
      }
    }

    // Clean up deleted annotations.
    let l = deletedAnnotationIndexes.length;
    while (l--) {
      this.annotations.splice(deletedAnnotationIndexes[l], 1);
    }
  }
}

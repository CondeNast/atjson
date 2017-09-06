import { Annotation } from './interfaces';

export class HIRNode {

  type: string;
  children: Array<HIRNode|string>;
  private start: number;
  private end: number;

  constructor(node: any) {
    this.type = node.type;

    this.start = node.start;
    this.end = node.end;

    this.children = [];
  }

  insertAnnotation(annotation: Annotation): Annotation|void {
    if (this.end < annotation.start) {
      return annotation;

    } else if (this.start > annotation.end) {
      throw new Error('This shouldn\'t happen, tbh.');

    } else {
      let remainingAnnotation = this.insertAnnotationIntoChildren(annotation);

      if (remainingAnnotation.start < this.end) {
        let childHIRNode = new HIRNode(remainingAnnotation);
        let leftoverAnnotation = {...remainingAnnotation} as Annotation;

        childHIRNode.end = Math.min(childHIRNode.end, this.end);
        leftoverAnnotation.start = this.end; // is this right?

        this.children.push(childHIRNode);

        if (leftoverAnnotation.start > leftoverAnnotation.end) {
          return;
        } else {
          if (leftoverAnnotation.end < this.end) {
            return;
          } else {
            return leftoverAnnotation;
          }
        }
      }
    }
  }

  insertAnnotationIntoChildren(annotation: Annotation): Annotation {
    if (this.children.length > 0) {
      return this.children.reduce((annotation: Annotation, child: HIRNode|string) => {
        if (child instanceof String) {
          return annotation;
        } else if (child instanceof HIRNode) {
          return child.insertAnnotation(annotation);
        }
      });
    } else {
      return annotation;
    }
  }

  insertText(text: string): void {
    return;
  }
}

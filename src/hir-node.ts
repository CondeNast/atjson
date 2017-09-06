import { Annotation } from './interfaces';

export class HIRNode {

  type: string;
  children: Array<HIRNode|string>;
  private start: number;
  private end: number;

  constructor(node) {
    this.type = node.type;
    this.children = node.children;
    this.start = node.start;
    this.end = node.end;
  }

  insertAnnotation(annotation: Annotation): void {
    if (this.end < annotation.start) {
      return annotation;
    } else if (this.start > annotation.end) {
      throw new Error('This shouldn\'t happen, tbh.');
    } else {
      // probably want to do soemthing with this.
    }
  }

  insertText(text: string): void {
    return;
  }
}

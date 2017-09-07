import { Annotation, AtJSON } from './interfaces';
import { HIRNode } from './hir-node';
export { Annotation, AtJSON, HIRNode };

export class HIR {

  atjson: AtJSON;
  rootNode: HIRNode;

  constructor(atjson: string | AtJSON) {
    if (typeof atjson === 'string') {
      this.atjson = {
        content: atjson,
        annotations: []
      } as AtJSON;
    } else {
      this.atjson = { ...atjson };
    }

    this.populateHIR();
  }

  toJSON(): object {
    return this.rootNode.toJSON();
  }

  populateHIR(): void {
    this.rootNode = new HIRNode({
      type: 'root',
      start: 0,
      end: this.atjson.content.length
    });

    let annotations = this.atjson.annotations.concat(this.parseContent());

    annotations
      .sort((a: Annotation, b: Annotation) => {
        if (a.start === b.start) {
          return (b.end - b.start) - (a.end - a.start);
        } else {
          return a.start - b.start;
        }
      }).forEach((annotation) => this.rootNode.insertAnnotation(annotation));

    this.rootNode.insertText(this.atjson.content);
  }

  parseContent(): Annotation[] {
    return this.getParser().parse(this.atjson.content);
  }

  getParser() {
    switch (this.atjson.contentType) {
      case undefined:
      case 'text/plain': {
        return { parse: this.plainTextParser };
      }
      default: {
        throw new Error('Unsupported Content-Type');
      }
    }
  }

  plainTextParser(content: string): Annotation[] {
    let paragraphs = content.split('\n\n');
    var startIdx = 0;

    return paragraphs.map((paragraph, i) => {
      let pghStartIdx = startIdx;
      startIdx += paragraph.length + 2;

      let pghEndIdx = pghStartIdx + paragraph.length;
      if (i < paragraphs.length - 1) {
        pghEndIdx += 2;
      }
      return {
        type: 'paragraph',
        start: pghStartIdx,
        end: pghEndIdx
      } as Annotation;
    });
  }
}

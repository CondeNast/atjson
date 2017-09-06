import { Annotation, AtJSON } from './interfaces';
import { HIRNode } from './hir-node';
export { Annotation, AtJSON, HIRNode };

export class HIR {

  atjson: AtJSON;
  rootNode: HIRNode;

  constructor(atjson: string | AtJSON) {
    if (atjson instanceof String) {
      this.atjson = {
        content: atjson,
        annotations: []
      } as AtJSON;
    } else {
      this.atjson = { ...atjson };
    }

    this.populateHIR();
  }

  toJSON(): HIRNode {
    return this.rootNode;
  }

  populateHIR(): void {
    this.rootNode = new HIRNode({
      type: 'root',
      children: [],
      start: 0,
      end: this.atjson.content.length
    });

    let annotations = this.atjson.annotations.concat(this.parseContent());

    annotations
      .sort((a: Annotation, b: Annotation) => a.start - b.start)
      .sort((a: Annotation, b: Annotation) => 0) // this should sort according to annotation heirarchy
      .forEach(this.rootNode.insertAnnotation);

    this.rootNode.insertText(this.atjson.content);
  }

  parseContent(): Annotation[] {
    return this.getParser().parse(this.atjson.content);
  }

  getParser() {
    switch (this.atjson.contentType) {
      case undefined: {
        return { parse: this.plainTextParser };
      }
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
    let startIdx = 0;
    return paragraphs.map(paragraph => {
      let pghStartIdx = startIdx;
      startIdx += 2;
      return {
        type: 'paragraph',
        start: pghStartIdx,
        end: paragraph.length + 2,
        children: [ paragraph + '\n\n' ]
      } as Annotation;
    });
  }
}

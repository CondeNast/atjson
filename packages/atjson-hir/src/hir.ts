import Annotation from './annotation';
import AtJSON from './atjson';
import HIRNode from './hir-node';

export default class HIR {

  atjson: AtJSON;
  rootNode: HIRNode;

  constructor(atjson: string | AtJSON) {
    if (typeof atjson === 'string') {
      this.atjson = new AtJSON(atjson);
    } else {
      this.atjson = new AtJSON(atjson);
    }

    this.populateHIR();
  }

  toJSON(): object {
    return this.rootNode.toJSON();
  }

  populateHIR(): void {

    let atjson = this.atjson;

    atjson.addAnnotations(this.parseContent());

    //let annotations = this.atjson.annotations.concat(this.parseContent());

    atjson.annotations
      .filter((a) => a.type === 'parse-token')
      .forEach((a) => atjson.deleteText(a));

    atjson.annotations
      .filter(a => a.type === 'parse-token' || a.type === 'parse-element')
      .forEach(a => atjson.removeAnnotation(a));

    this.rootNode = new HIRNode({
      type: 'root',
      start: 0,
      end: atjson.content.length
    });

    atjson.annotations
      .sort((a: Annotation, b: Annotation) => {
        if (a.start === b.start) {
          return (b.end - b.start) - (a.end - a.start);
        } else {
          return a.start - b.start;
        }
      }).forEach((annotation) => this.rootNode.insertAnnotation(annotation));

    this.rootNode.insertText(atjson.content);
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
      case 'text/atjson': {
        return { parse() { return []; } };
      }
      default: {
        throw new Error('Unsupported Content-Type');
      }
    }
  }

  plainTextParser(content: string): Annotation[] {
    let prevIdx = 0;
    let breakIdx = content.indexOf("\n\n", 0);

    let annotations = [];

    while (breakIdx != -1) {
      annotations.push({
        type: 'paragraph',
        start: prevIdx,
        end: breakIdx
      } as Annotation);

      annotations.push({
        type: 'parse-element',
        start: prevIdx,
        end: breakIdx + 2,
      } as Annotation);

      annotations.push({
        type: 'parse-token',
        start: breakIdx,
        end: breakIdx + 2
      } as Annotation);

      prevIdx = breakIdx + 2;
      breakIdx = content.indexOf("\n\n", breakIdx + 2);
    }

    if (prevIdx < content.length) {
      annotations.push({
        type: 'paragraph',
        start: prevIdx,
        end: content.length
      } as Annotation);
    }

    return annotations;
  }
}

import { Annotation } from 'atjson';

import * as parse5 from 'parse5';

const TAG_MAP = {
  'p': 'paragraph',
  'ul': 'unordered-list',
  'ol': 'ordered-list',
  'li': 'list-item'
}

export class Parser {
  content: string;

  constructor(content: string) {
    this.content = content;
  }

  parse(): Annotation[] {
    let tree = parse5.parseFragment(this.content, {locationInfo: true});
    return this.walkNode(tree);
  }

  newAnnotation(type: string, location: { startOffset: number, endOffset: number }, extra?: {}) {
    return Object.assign({
      type: type,
      start: location.startOffset,
      end: location.endOffset
    }, extra);
  }

  parseElement(type: string, location: { startOffset: number, endOffset: number }) {
    return this.newAnnotation('parse-element', location, { htmlType: type });
  }

  parseToken(type: string, location: { startOffset: number, endOffset: number }) {
    return this.newAnnotation('parse-token', location, { htmlType: type });
  }

  /*
   * Walk the node, converting it and any children to annotations.
   */
  walkNode(node): Annotation[] {

    let annotations: Annotation[] = [];

    if (node.__location) {
      annotations = this.convertNodeToAnnotations(node);
    }

    for (let i = 0, len = node.childNodes.length; i < len; i++) {
      let child = node.childNodes[i];

      if (child.childNodes) {
        annotations = annotations.concat(this.walkNode(child));
      }
    }

    return annotations;
  }

  /*
   * Convert the node to annotations!
   */
  convertNodeToAnnotations(node): Annotation[] {

    let type;

    if (TAG_MAP[node.tagName]) {
      type = TAG_MAP[node.tagName];
    } else {
      type = node.tagName;
    }

    //annotations.push(this.parseElement(type, node.__location));

    if (!node.__location.startTag) {

      // This is a self-closing tag, so we include the parse-token to remove
      // the markup, alongside the element itself to preserve it.
      return [
        this.parseToken(type, node.__location),
        this.newAnnotation(type, node.__location)
      ];

    } else if (node.__location.startTag) {

      if (!node.__location.endTag) {
        return this.convertSelfClosingNodeToAnnotations(type, node);
      } else {
        return this.convertEnclosedNodeToAnnotations(type, node);
      }
    } else {
      return [];
    }
  }

  convertSelfClosingNodeToAnnotations(type: string, node): Annotation[] {
    let annotations = [];

    annotations.push(this.parseToken(type, node.__location.startTag));
    annotations.push(this.newAnnotation(type, node.__location));

    return annotations;
  }

  convertEnclosedNodeToAnnotations(type: string, node) {
    let annotations = [];

    annotations.push(this.parseToken(type, node.__location.startTag));
    annotations.push(this.parseToken(type, node.__location.endTag));

    annotations.push({
      type: type,
      start: node.__location.startTag.endOffset,
      end: node.__location.endTag.startOffset
    });

    return annotations;
  }

}

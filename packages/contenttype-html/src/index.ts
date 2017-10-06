import { Annotation } from '@atjson/core';

import * as parse5 from 'parse5';

const TAG_MAP: { [name: string]: string } = {
  p: 'paragraph',
  ul: 'unordered-list',
  ol: 'ordered-list',
  li: 'list-item',
  img: 'image'
};

const isElement = (node: parse5.AST.Default.Node | parse5.AST.Default.Element | parse5.AST.Default.ParentNode): node is parse5.AST.Default.Element => {
  return ((node as parse5.AST.Default.Element).nodeName !== undefined &&
          (node as parse5.AST.Default.Element).nodeName !== '#text' &&
          (node as parse5.AST.Default.Element).nodeName !== ''
         );
};

const isParentNode = (node: parse5.AST.Default.DocumentFragment | any): node is parse5.AST.Default.DocumentFragment => {
  return (node as parse5.AST.Default.DocumentFragment).nodeName === '#document-fragment';
};

export class Parser {

  content: string;

  constructor(content: string) {
    this.content = content;
  }

  parse(): Annotation[] {
    let tree = parse5.parseFragment(this.content, {locationInfo: true});
    if (isParentNode(tree)) return this.walkChildren(tree.childNodes);
    throw new Error('Invalid return from parser. Failing.');
  }

  newAnnotation(type: string, location: parse5.MarkupData.Location, extra?: {}) {
    return Object.assign({
      type,
      attributes: {},
      start: location.startOffset,
      end: location.endOffset
    }, extra);
  }

  parseElement(type: string, location: parse5.MarkupData.Location ) {
    return this.newAnnotation('parse-element', location, { htmlType: type });
  }

  parseToken(type: string, location: parse5.MarkupData.Location ) {
    return this.newAnnotation('parse-token', location, { htmlType: type });
  }

  /*
   * Walk the node, converting it and any children to annotations.
   */
  walkNode(node: parse5.AST.Default.Element): Annotation[] {
    let annotations = this.convertNodeToAnnotations(node);
    return annotations.concat(this.walkChildren(node.childNodes));
  }

  walkChildren(children: parse5.AST.Default.Node[]): Annotation[] {
    return (children || []).reduce((annotations, child): Annotation[] => {
      if (isElement(child)) {
        return annotations.concat(this.walkNode(child));
      } else {
        return annotations;
      }
    }, [] as Annotation[]);
  }

  /*
   * Convert the node to annotations!
   */
  convertNodeToAnnotations(node: parse5.AST.Default.Element): Annotation[] {
    let type;

    if (TAG_MAP[node.tagName]) {
      type = TAG_MAP[node.tagName];
    } else {
      type = node.tagName;
    }

    // annotations.push(this.parseElement(type, node.__location));

    if (node.__location === undefined) return [];

    if (node.__location.startTag) {
      if (node.__location.endTag) {
        return this.convertEnclosedNodeToAnnotations(type, node);

      } else {
        return this.convertSelfClosingNodeToAnnotations(type, node);

      }
    } else {
      // This is a self-closing tag, so we include the parse-token to remove
      // the markup, alongside the element itself to preserve it.
      return [
        this.parseToken(type, node.__location),
        this.newAnnotation(type, node.__location, {
          attributes: this.attributesForNode(node)
        })
      ];
    }
  }

  convertElementToAttrObject(attrs: { [key: string]: string }, attr: parse5.AST.Default.Attribute) {
    attrs[attr.name] = attr.value;
    return attrs;
  }

  attributesForNode(node: parse5.AST.Default.Element): object {
    return (node.attrs || []).reduce(this.convertElementToAttrObject, {});

      /*
    (attrs, { name, value }: { name: string, value: string }) => {
      attrs[name] = value;
      return attrs;
    }, {}: object);
       */
  }

  convertSelfClosingNodeToAnnotations(type: string, node: parse5.AST.Default.Element): Annotation[] {
    let annotations = [];

    if (node.__location !== undefined) {
      annotations.push(this.parseToken(type, node.__location.startTag));
      annotations.push(this.newAnnotation(type, node.__location));
    } else {
      throw new Error('We really need location data here.');
    }

    return annotations;
  }

  convertEnclosedNodeToAnnotations(type: string, node: parse5.AST.Default.Element) {
    let annotations = [];

    if (node.__location) {
      annotations.push(this.parseToken(type, node.__location.startTag));
      annotations.push(this.parseToken(type, node.__location.endTag));

      annotations.push({
        type,
        attributes: this.attributesForNode(node),
        start: node.__location.startTag.endOffset,
        end: node.__location.endTag.startOffset
      });
    }

    return annotations;
  }
}

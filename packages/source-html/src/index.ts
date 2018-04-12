import Document, { Annotation } from '@atjson/document';
import * as parse5 from 'parse5';
import schema from './schema';
import HTMLSchemaTranslator from './translator';

export { schema };

type Node = parse5.AST.Default.Node | parse5.AST.Default.Element | parse5.AST.Default.ParentNode;
type DocumentFragment = parse5.AST.Default.Node | parse5.AST.Default.Element | parse5.AST.Default.ParentNode;

function isElement(node: Node) {
  return node.nodeName !== undefined &&
         node.nodeName !== '#text' &&
         node.nodeName !== '';
}

function isParentNode(node: DocumentFragment | any) {
  return node.nodeName === '#document-fragment';
}

function isText(node: Node) {
  return node.nodeName === '#text';
}

interface Attributes {
  [key: string]: string;
}

type Attribute = parse5.AST.Default.Attribute;

function getAttributes(node: Node): Attributes {
  let attrs: Attributes = (node.attrs || []).reduce((attributes: Attributes, attr: Attribute) => {
    attributes[attr.name] = attr.value;
    return attributes;
  }, {});

  if (node.tagName === 'a' && attrs.href) {
    attrs.href = decodeURI(attrs.href);
  }
  return attrs;
}

class Parser {

  content: string;

  annotations: Annotation[];

  private html: string;

  private offset: number;

  constructor(html: string) {
    this.html = html;
    this.content = '';
    this.annotations = [];
    this.offset = 0;

    let tree = parse5.parseFragment(html, { locationInfo: true });
    if (isParentNode(tree)) {
      return this.walk(tree.childNodes);
    }
    throw new Error('Invalid return from parser. Failing.');
  }

  walk(nodes: Node[]) {
    return (nodes || []).forEach((node: Node) => {
      if (isElement(node)) {
        let annotationGenerator = this.convertNodeToAnnotation(node);
        // <tag>
        annotationGenerator.next();
        this.walk(node.childNodes);
        // </tag>
        annotationGenerator.next();
      } else if (isText(node)) {
        let html = this.html.slice(node.__location.startOffset, node.__location.endOffset);
        let text = node.value;
        this.content += text;
        this.offset += html.length - text.length;
      }
    });
  }

  convertTag(node: Node, which: 'startTag' | 'endTag'): number {
    let { startOffset: start, endOffset: end } = node.__location[which];
    this.annotations.push({
      type: 'parse-token',
      attributes: { tagName: node.tagName },
      start: start - this.offset,
      end: end - this.offset
    });
    this.content += this.html.slice(start, end);
    return end - this.offset;
  }

  *convertNodeToAnnotation(node: Node) {
    let location = node.__location;
    let tagName = node.tagName;

    if (location == null) {
      yield;
      return;
    }

    if (location.startTag && location.endTag) {
      let start = this.convertTag(node, 'startTag');

      yield;

      this.annotations.push({
        type: `-html-${tagName}`,
        attributes: getAttributes(node),
        start,
        end: location.endTag.startOffset - this.offset
      });

      this.convertTag(node, 'endTag');

    } else if (location.startTag) {
      let start = this.convertTag(node, 'startTag');

      yield;

      this.annotations.push({
        type: `-html-${tagName}`,
        attributes: getAttributes(node),
        start,
        end: location.endOffset - this.offset
      });

    } else {
      let start = location.startOffset - this.offset;
      let end = location.endOffset - this.offset;

      this.content += this.html.slice(location.startOffset, location.endOffset);
      this.annotations.push({
        type: 'parse-token',
        attributes: { tagName },
        start,
        end
      }, {
        type: `-html-${tagName}`,
        attributes: getAttributes(node),
        start,
        end
      });

      yield;
    }
  }
}

export default class HTMLSource extends Document {

  constructor(content: string) {
    let parser = new Parser(content);
    super({
      content: parser.content,
      contentType: 'text/html',
      annotations: parser.annotations,
      schema
    });
  }

  toCommonSchema(): Document {
    return new HTMLSchemaTranslator(this);
  }
}

import Document, { AnnotationJSON, Attributes } from '@atjson/document';
import * as parse5 from 'parse5/lib';
import {
  Anchor,
  Blockquote,
  Bold,
  Break,
  Code,
  DeletedText,
  Emphasis,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  HorizontalRule,
  Image,
  Italic,
  ListItem,
  OrderedList,
  Paragraph,
  PreformattedText,
  Strikethrough,
  Strong,
  Subscript,
  Superscript,
  Underline,
  UnorderedList
} from './annotations';
import HTMLSchemaTranslator from './translator';

function isElement(node: parse5.AST.Default.Node) {
  return node.nodeName !== undefined &&
         node.nodeName !== '#text' &&
         node.nodeName !== '';
}

function isParentNode(node: parse5.AST.Default.DocumentFragment | any) {
  return node.nodeName === '#document-fragment';
}

function isText(node: parse5.AST.Default.Node) {
  return node.nodeName === '#text';
}

function getAttributes(node: parse5.AST.Default.Element): Attributes {
  let attrs: Attributes = (node.attrs || []).reduce((attributes: Attributes, attr: parse5.AST.Default.Attribute) => {
    attributes[`-html-${attr.name}`] = attr.value;
    return attributes;
  }, {});

  if (node.tagName === 'a' && typeof attrs['-html-href'] === 'string') {
    attrs['-html-href'] = decodeURI(attrs['-html-href']);
  }
  return attrs;
}

class Parser {

  content: string;

  annotations: AnnotationJSON[];

  private html: string;

  private offset: number;

  constructor(html: string) {
    this.html = html;
    this.content = '';
    this.annotations = [];
    this.offset = 0;

    let tree = parse5.parseFragment(html, { locationInfo: true }) as parse5.AST.Default.DocumentFragment;
    if (isParentNode(tree)) {
      this.walk(tree.childNodes);
    } else {
      throw new Error('Invalid return from parser. Failing.');
    }
  }

  walk(nodes: parse5.AST.Default.Node[]) {
    return (nodes || []).forEach((node: parse5.AST.Default.Node) => {
      if (isElement(node)) {
        let elementNode = node as parse5.AST.Default.Element;
        let annotationGenerator = this.convertNodeToAnnotation(elementNode);
        // <tag>
        annotationGenerator.next();
        this.walk(elementNode.childNodes);
        // </tag>
        annotationGenerator.next();
      } else if (isText(node)) {
        let textNode = node as parse5.AST.Default.TextNode;
        let location = textNode.__location;
        if (location) {
          let html = this.html.slice(location.startOffset, location.endOffset);
          let text = textNode.value;
          this.content += text;
          this.offset += html.length - text.length;
        }
      }
    });
  }

  convertTag(node: parse5.AST.Default.Element, which: 'startTag' | 'endTag'): number {
    let location = node.__location;
    if (location == null) return -1;

    let { startOffset: start, endOffset: end } = location[which];
    let reason = which === 'startTag' ? `<${node.tagName}>` : `</${node.tagName}>`;
    this.annotations.push({
      type: '-atjson-parse-token',
      attributes: { '-atjson-reason': reason },
      start: start - this.offset,
      end: end - this.offset
    });
    this.content += this.html.slice(start, end);
    return end - this.offset;
  }

  *convertNodeToAnnotation(node: parse5.AST.Default.Element): IterableIterator<void> {
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
        type: '-atjson-parse-token',
        attributes: { '-atjson-reason': `<${tagName}/>` },
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
  static contentType = 'appplication/vnd.atjson+html';
  static schema = [
    Anchor,
    Bold,
    Blockquote,
    Break,
    Code,
    DeletedText,
    Emphasis,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    HorizontalRule,
    Italic,
    Image,
    ListItem,
    OrderedList,
    Paragraph,
    PreformattedText,
    Strikethrough,
    Strong,
    Subscript,
    Superscript,
    Underline,
    UnorderedList
  ];
  static fromSource(html: string) {
    let parser = new Parser(html);
    return new this({
      content: parser.content,
      annotations: parser.annotations
    });
  }

  toCommonSchema(): Document {
    return new HTMLSchemaTranslator(this).translate();
  }
}

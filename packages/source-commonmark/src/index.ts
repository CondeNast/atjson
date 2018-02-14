import Document, { Annotation } from '@atjson/document';
import * as MarkdownIt from 'markdown-it';
import schema from './schema';

interface Attributes {
  [key: string]: string;
}

type Tuple = [string, string];

function getAttributes(token: MarkdownIt.Token): Attributes {
  return (token.attrs || []).reduce((attributes: Attributes, attribute: Tuple) => {
    attributes[attribute[0]] = attribute[1];
    return attributes;
  }, {});
}

interface Node {
  name: string;
  open?: MarkdownIt.Token;
  close?: MarkdownIt.Token;
  value?: MarkdownIt.Token;
  parent?: Node;
  children?: (Node | string)[];
}

function toTree(tokens: MarkdownIt.Token[], rootNode: Node) {
  let currentNode = rootNode;
  tokens.forEach(token => {
    // Ignore softbreak as per markdown-it defaults
    if (token.tagName === 'br' && token.type === 'softbreak') {
      currentNode.children.push('\n');
    } else if (token.type === 'text') {
      currentNode.children.push(token.content);
    } else if (token.type === 'inline') {
      toTree(token.children, currentNode);
    } else if (token.children && token.children.length > 0) {
      let node = {
        name: token.type,
        open: token,
        parent: currentNode,
        children: []
      };
      currentNode.children.push(node);
      toTree(token.children, node);
    } else if (token.nesting === 1) {
      let node = {
        name: token.type.replace(/_open$/, ''),
        open: token,
        close: token,
        parent: currentNode,
        children: []
      };
      currentNode.children.push(node);
      currentNode = node;
    } else if (token.nesting === -1) {
      currentNode.close = token;
      currentNode = currentNode.parent;
    } else {
      currentNode.children.push({
        name: token.type,
        value: token
      });
    }
  });
  return rootNode;
}

class Parser {
  constructor(tokens: MarkdownIt.Token[]) {
    this.content = '';
    this.annotations = [];
    this.walk(toTree(tokens, { children: [] }).children);
  }

  walk(nodes: Node[]) {
    return nodes.forEach((node: Node | string) => {
      if (typeof node === 'string') {
        this.content += node;
      } else if (node.name === 'image') {
        let token = node.open;
        token.atts.push(['alt', node.children.filter(node => typeof node === 'string').join('')]);
        this.convertTokenToAnnotation(node.name, token);
      } else if (node.children) {
        let annotationGenerator = this.convertBlockAnnotation(node.name, node.open, node.close);
        annotationGenerator.next();
        this.walk(node.children);
        annotationGenerator.next();
      } else {
        this.convertTokenToAnnotation(node.name, node.value);
      }
    });
  }

  *convertBlockAnnotation(name: string, open: MarkdownIt.Token, close: MarkdownIt.Token) {
    let start = this.content.length;
    this.content += '\uFFFC';
    this.annotations.push({
      type: 'parse-token',
      attributes: {
        type: open.type
      },
      start,
      end: start + 1
    });
    yield;

    this.content += '\uFFFC';

    let end = this.content.length;
    this.annotations.push({
      type: 'parse-token',
      attributes: {
        type: close.type
      },
      start: end - 1,
      end
    }, {
      type: name,
      attributes: getAttributes(open),
      start,
      end
    });
  }

  convertTokenToAnnotation(name: string, token: MarkdownIt.Token) {
    let start = this.content.length;
    let end = start + 1;
    this.content += '\uFFFC';
    this.annotations.push({
      type: 'parse-token',
      attributes: {
        type: token.type
      },
      start,
      end
    }, {
      type: name,
      attributes: getAttributes(token),
      start,
      end
    });
  }
}

export default class extends Document {
  constructor(markdown: string) {
    let md = MarkdownIt('commonmark');
    let parser = new Parser(md.parse(markdown, {}));
    super({
      content: parser.content,
      contentType: 'text/commonmark',
      annotations: parser.annotations,
      schema
    });
  }
}

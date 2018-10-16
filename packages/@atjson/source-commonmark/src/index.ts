import Document, { AnnotationJSON } from '@atjson/document';
import * as entities from 'entities';
import * as MarkdownIt from 'markdown-it';
import { v4 as uuid } from 'uuid';
import { Blockquote, BulletList, CodeBlock, CodeInline, Emphasis, Fence, Hardbreak, Heading, HorizontalRule, HTML, Image, Link, ListItem, OrderedList, Paragraph, Strong } from './annotations';

export * from './annotations';

interface Attributes {
  [key: string]: string | number | boolean | null;
}

function getAttributes(token: MarkdownIt.Token): Attributes {
  return (token.attrs || []).reduce((attributes: Attributes, attribute: string[]) => {
    attributes[`-commonmark-${attribute[0]}`] = attribute[1];
    return attributes;
  }, {});
}

interface Node {
  name: string;
  open?: MarkdownIt.Token;
  close?: MarkdownIt.Token;
  value?: MarkdownIt.Token | string;
  parent?: Node;
  children: Node[];
}

function toTree(tokens: MarkdownIt.Token[], rootNode: Node) {
  let currentNode = rootNode;
  tokens.forEach(token => {
    // Ignore softbreak as per markdown-it defaults
    if (token.tag === 'br' && token.type === 'softbreak') {
      currentNode.children.push({
        name: 'text',
        value: '\n',
        parent: currentNode,
        children: []
      });
    } else if (token.type === 'text') {
      currentNode.children.push({
        name: 'text',
        value: token.content,
        parent: currentNode,
        children: []
      });
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
      if (currentNode.parent) {
        currentNode = currentNode.parent;
      }
    } else {
      let text = token.content;
      // If there is a backtick as the first or last
      // character, we need to provide spaces around
      // the code, otherwise we'll get two code blocks
      // instead of one code block with backticks in it
      if (token.type === 'code_inline') {
        if (text[0] === '`') {
          text = ' ' + text;
        }
        if (text[text.length - 1] === '`') {
          text += ' ';
        }
      }
      currentNode.children.push({
        name: token.type,
        open: token,
        close: token,
        parent: currentNode,
        children: [{
          name: 'text',
          value: text,
          parent: currentNode,
          children: []
        }]
      });
    }
  });
  return rootNode;
}

function getText(node: Node): Node[] {
  return node.children.reduce((textNodes: Node[], child: Node) => {
    if (child.name === 'text') {
      textNodes.push(child);
    } else if (child.children) {
      textNodes.push(...getText(child));
    }
    return textNodes;
  }, []);
}

class Parser {
  content: string;
  annotations: AnnotationJSON[];
  private handlers: any;

  constructor(tokens: MarkdownIt.Token[], handlers: any) {
    this.content = '';
    this.handlers = handlers;
    this.annotations = [];
    this.walk(toTree(tokens, { name: 'root', children: [] }).children);
  }

  walk(nodes: Node[]) {
    nodes.forEach((node: Node) => {
      if (node.name === 'text') {
        this.content += node.value;
      } else if (node.open) {
        // Markdown-It strips out all unicode whitespace characters.
        if (node.name === 'paragraph' && node.children.length === 0) {
          node.children.push({
            name: 'text',
            parent: node,
            value: '\u202F',
            children: []
          });
        } else if (node.name === 'image' && node.open) {
          let token = node.open;
          token.attrs = token.attrs || [];
          token.attrs.push(['alt', getText(node).map(n => n.value).join('')]);
          node.children = [];
        }
        let attrs: Attributes = {};
        // Identify whether the list is tight (paragraphs collapse)
        if ((node.name === 'bullet_list' || node.name === 'ordered_list') && node.open) {
          let isTight = node.children.some(items => {
            return items.children.filter(child => child.name === 'paragraph')
                                 .some(child => !!(child.open && child.open.hidden));
          });
          attrs['-commonmark-tight'] = isTight;
        }
        let annotationGenerator = this.convertTokenToAnnotation(node.name, node.open, attrs);
        annotationGenerator.next();
        this.walk(node.children);
        annotationGenerator.next();
      }
    });
  }

  *convertTokenToAnnotation(name: string, open: MarkdownIt.Token, attrs: Attributes): IterableIterator<void> {
    let start = this.content.length;
    this.content += '\uFFFC';
    this.annotations.push({
      id: uuid(),
      type: '-atjson-parse-token',
      start,
      end: start + 1,
      attributes: {
        '-atjson-reason': `${name}_open`
      }
    });
    yield;

    this.content += '\uFFFC';

    let end = this.content.length;
    let attributes = Object.assign(getAttributes(open), attrs);
    if (name === 'heading') {
      attributes['-commonmark-level'] = parseInt(open.tag[1], 10);
    }
    if (name === 'fence') {
      attributes['-commonmark-info'] = entities.decodeHTML5(open.info.trim());
    }

    if (this.handlers[name]) {
      Object.assign(attributes, this.handlers[name](open));
    }
    this.annotations.push({
      id: uuid(),
      type: '-atjson-parse-token',
      start: end - 1,
      end,
      attributes: {
        '-atjson-reason': `${name}_close`
      }
    }, {
      id: uuid(),
      type: `-commonmark-${name}`,
      start,
      end,
      attributes
    });
  }
}

export default class CommonMarkSource extends Document {
  static contentType = 'application/vnd.atjson+commonmark';
  static schema = [Blockquote, BulletList, CodeBlock, CodeInline, Emphasis, Fence, Hardbreak, Heading, HorizontalRule, HTML, Image, Link, ListItem, OrderedList, Paragraph, Strong];

  static fromSource(markdown: string) {
    let md = this.markdownParser;
    let parser = new Parser(md.parse(markdown, { linkify: false }), this.contentHandlers);

    return new this({
      content: parser.content,
      annotations: parser.annotations
    });
  }

  static get markdownParser() {
    return MarkdownIt('commonmark');
  }

  static get contentHandlers() {
    return {};
  }

  toCommonSchema(): Document {
    let doc = this.clone();

    doc.where({ type: '-commonmark-bullet_list' }).set({ type: 'list', attributes: { type: 'bulleted' } });
    doc.where({ type: '-commonmark-code_block' }).set({ type: 'code', display: 'block', attributes: { style: 'block' } });
    doc.where({ type: '-commonmark-code_inline' }).set({ type: 'code', display: 'inline', attributes: { style: 'inline' } });
    doc.where({ type: '-commonmark-em' }).set({ type: 'italic' });
    doc.where({ type: '-commonmark-fence' }).set({ type: 'code', display: 'block', attributes: { style: 'fence' } });
    doc.where({ type: '-commonmark-hardbreak' }).set({ type: 'line-break' });
    doc.where({ type: '-commonmark-hr' }).set({ type: 'horizontal-rule' });
    doc.where({ type: '-commonmark-html_block' }).set({ type: 'html', display: 'block', attributes: { type: 'block' } });
    doc.where({ type: '-commonmark-html_inline' }).set({ type: 'html', display: 'inline', attributes: { type: 'inline' } });
    doc.where({ type: '-commonmark-image' }).set({ type: 'image' }).rename({ attributes: { src: 'url', alt: 'description' } });
    doc.where({ type: '-commonmark-link' }).rename({ attributes: { href: 'url' } });
    doc.where({ type: '-commonmark-list_item' }).set({ type: 'list-item' });
    doc.where({ type: '-commonmark-ordered_list' }).set({ type: 'list', attributes: { type: 'numbered' } }).rename({ attributes: { start: 'startsAt' } });
    doc.where({ type: '-commonmark-strong' }).set({ type: 'bold' });

    return doc;
  }
}

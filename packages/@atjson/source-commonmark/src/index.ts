import Document, { Annotation, Schema } from '@atjson/document';
import schema from '@atjson/schema';
import * as entities from 'entities';
import * as MarkdownIt from 'markdown-it';
import markdownSchema from './schema';

export { default as schema } from './schema';

interface Attributes {
  [key: string]: string | number | boolean | null;
}

function getAttributes(token: MarkdownIt.Token): Attributes {
  return (token.attrs || []).reduce((attributes: Attributes, attribute: string[]) => {
    attributes[attribute[0]] = attribute[1];
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
  annotations: Annotation[];
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
        if (node.name === 'paragraph' && node.children.length === 0) {
          node.children.push({
            name: 'text',
            parent: node,
            value: '\u00A0',
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
          attrs.tight = isTight;
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
      type: 'parse-token',
      attributes: {
        type: `${name}_open`
      },
      start,
      end: start + 1
    });
    yield;

    this.content += '\uFFFC';

    let end = this.content.length;
    let attributes = Object.assign(getAttributes(open), attrs);
    if (name === 'heading') {
      attributes.level = parseInt(open.tag[1], 10);
    }
    if (name === 'fence') {
      attributes.info = entities.decodeHTML5(open.info.trim());
    }

    if (this.handlers[name]) {
      Object.assign(attributes, this.handlers[name](open));
    }
    this.annotations.push({
      type: 'parse-token',
      attributes: {
        type: `${name}_close`
      },
      start: end - 1,
      end
    }, {
      type: name,
      attributes,
      start,
      end
    });
  }
}

export default class CommonMarkSource extends Document {

  constructor(markdown: string) {
    super({
      content: '',
      contentType: 'text/commonmark',
      annotations: [],
      schema: markdownSchema as Schema
    });

    // Markdown-It strips out all unicode whitespace characters.
    // Instead of varying between narrow non-breaking space and
    // non-breaking spaces, we use U+00A0 (No-Break Space)
    // for consistency
    markdown = markdown.replace(/\u202F/gu, '\u00A0');
    let md = this.markdownParser();
    let parser = new Parser(md.parse(markdown, { linkify: false }), this.contentHandlers());

    this.content = parser.content;
    this.addAnnotations(...parser.annotations);
  }

  markdownParser() {
    return MarkdownIt('commonmark');
  }

  contentHandlers() {
    return {};
  }

  toCommonSchema() {
    let doc = new Document({
      content: this.content,
      contentType: 'text/atjson',
      annotations: [...this.annotations],
      schema: schema as Schema
    });

    doc.where({ type: 'bullet_list' }).set({ type: 'list', attributes: { type: 'bulleted' } });
    doc.where({ type: 'code_block' }).set({ type: 'code', display: 'block', attributes: { style: 'block' } });
    doc.where({ type: 'code_inline' }).set({ type: 'code', display: 'inline', attributes: { style: 'inline' } });
    doc.where({ type: 'em' }).set({ type: 'italic' });
    doc.where({ type: 'fence' }).set({ type: 'code', display: 'block', attributes: { style: 'fence' } });
    doc.where({ type: 'hardbreak' }).set({ type: 'line-break' });
    doc.where({ type: 'hr' }).set({ type: 'horizontal-rule' });
    doc.where({ type: 'html_block' }).set({ type: 'html', display: 'block', attributes: { type: 'block' } });
    doc.where({ type: 'html_inline' }).set({ type: 'html', display: 'inline', attributes: { type: 'inline' } });
    doc.where({ type: 'image' }).set({ type: 'image' }).map({ attributes: { src: 'url', alt: 'description' } });
    doc.where({ type: 'link' }).map({ attributes: { href: 'url' } });
    doc.where({ type: 'list_item' }).set({ type: 'list-item' });
    doc.where({ type: 'ordered_list' }).set({ type: 'list', attributes: { type: 'numbered' } }).map({ attributes: { start: 'startsAt' } });
    doc.where({ type: 'strong' }).set({ type: 'bold' });

    return doc;
  }
}

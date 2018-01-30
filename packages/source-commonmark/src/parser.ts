import Document, { Annotation } from '@atjson/document';
import { MarkdownIt, Token } from 'markdown-it';
import ContentType from './index';

export interface AttributeList {
  [key: string]: any;
}

interface TempAnnotation {
  type: string;
  start: number;
  __annotations: Annotation[];
  attributes: AttributeList;
}

export default class Parser {
  markdown: string;
  content: string;
  annotations: Annotation[];

  private TAG_MAP: { [key: string]: string };
  private stack: TempAnnotation[];
  private parser: MarkdownIt;
  private contenttype: ContentType;

  constructor(markdown: string, contenttype: ContentType) {
    this.markdown = markdown;
    this.contenttype = contenttype;
    this.parser = this.contenttype.constructor.parser;
    this.TAG_MAP = this.contenttype.constructor.TAG_MAP;
  }

  parse(): Document {
    this.reset();

    let tokens = this.parser.parse(this.markdown, {});
    this.parseTokens(tokens);

    return new Document({
      content: this.content,
      annotations: this.annotations
    });
  }

  reset(): void {
    this.annotations = [];
    this.content = '';
    this.stack = [];
  }

  parseTokens(tokens: Token[]): void {
    for (let i = 0, len = tokens.length; i < len; i++) {
      let prevToken;
      let nextToken;
      if (i > 0) prevToken = tokens[i - 1];
      if (i + 1 < len) nextToken = tokens[i + 1];
      this.parseToken(tokens[i], prevToken, nextToken);
    }
  }

  normalizeToken(token: Token): Token {
    if (this.TAG_MAP[token.tag]) {
      token.tag = this.TAG_MAP[token.tag];
    }

    if (!token.tag && token.type === 'html_block') {
      token.tag = 'html';
    }

    return token;
  }

  parseToken(token: Token, prevToken?: Token, nextToken?: Token): void {
    if (token.hidden) return;

    token = this.normalizeToken(token);

    if (token.block && token.type !== 'inline' && token.nesting !== -1 && prevToken && prevToken.hidden) this.content += '\n';

    // open new annotation.
    if (token.nesting === 1) {
      this.startToken(token);

    // close an annotation
    } else if (token.nesting === -1) {
      this.endToken(token);

    // work on current annotation
    } else if (token.nesting === 0) {
      this.handleInlineToken(token);

    }

    if (token.block && token.type !== 'inline') {
      let needNewline = true;

      if (token.nesting === 1 && nextToken) {
        if (nextToken.type === 'inline' || nextToken.hidden) {
          // no newline
          needNewline = false;
        } else if (nextToken.nesting === -1 && token.tag === this.normalizeToken(nextToken).tag) {
          // no newline
          needNewline = false;
        }
      }

      if (needNewline) this.content += '\n';
    }
  }

  handleInlineToken(token: Token) {
    if (this.contenttype[token.type]) {
      this.contenttype[token.type](this, token);
    } else if (token.children) {
      if (token.type !== 'inline') {
        this.startToken(token);
      }

      this.parseTokens(token.children);

      if (token.type !== 'inline') {
        this.endToken(token);
      }
    } else if (token.type && typeof(token.content) === 'string') {
      this.annotations.push({
        type: token.tag,
        start: this.content.length,
        end: this.content.length + token.content.length,
        attributes: {}
      });

      this.content += token.content;
    }
  }

  convertAttributesToAttributeList(attrs: AttributeList, [key, value]: [string, string]) {
    attrs[key] = value.toString();
    return attrs;
  }

  startToken(token: Token): void {
    let attributes: AttributeList = {};
    (token.attrs || []).reduce(this.convertAttributesToAttributeList, attributes);

    this.stack.push({
      type: token.tag,
      start: this.content.length,
      __annotations: this.annotations,
      attributes
    });
    this.annotations = [];
  }

  endToken(token: Token): void {
    let tempAnnotation = this.stack.pop();

    if (tempAnnotation === undefined) return;
    if (tempAnnotation.type !== token.tag) throw new Error('Unexpected mismatch in Token stream.');

    let childAnnotations = this.annotations;
    this.annotations = tempAnnotation.__annotations;

    let annotation: Annotation = {
      type: tempAnnotation.type,
      start: tempAnnotation.start,
      end: this.content.length,
      attributes: tempAnnotation.attributes
    };

    if (token.tag.length > 0) {
      this.annotations.push(annotation);
    }

    this.annotations = this.annotations.concat(childAnnotations);
  }
}

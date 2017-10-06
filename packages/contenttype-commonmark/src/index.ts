import { Annotation, AtJSON } from '@atjson/core';
import * as MarkdownIt from 'markdown-it';
import { Token } from 'markdown-it';
import * as entities from 'entities';

const parser = MarkdownIt('commonmark');

const TAG_MAP: { [tagName: string]: string } = {
  p: 'paragraph',
  img: 'image',
  ol: 'ordered-list',
  ul: 'unordered-list',
  li: 'list-item'
};

const HANDLERS = {
  'hardbreak': (state, token) => {
    state.annotations.push({
      type: token.tag,
      start: state.content.length,
      end: state.content.length,
      attributes: {}
    });
    state.content += '\n';
  },

  'softbreak': (state, token) => {
    state.content += '\n';
  },

  'hr': (state, token) => {
    state.annotations.push({
      type: token.tag,
      start: state.content.length,
      end: state.content.length,
      attributes: {}
    });
  },

  'code_block': (state, token) => {

    let attributes: AttributeList = (token.attrs || []).reduce(state.convertAttributesToAttributeList, {});

    state.annotations.push({
      type: 'pre',
      start: state.content.length,
      end: state.content.length + token.content.length,
      attributes: attributes;
    });

    state.annotations.push({
      type: token.tag,
      start: state.content.length,
      end: state.content.length + token.content.length,
      attributes: {}
    });

    state.content += token.content;
  },

  'fence': (state, token) => {

    let attributes: AttributeList = (token.attrs || []).reduce(state.convertAttributesToAttributeList, {});

    let info = token.info ? token.info.trim() : '';

    if (info) {

      let UNESCAPE_MD_RE  = /\\([!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~])/g;
      let ENTITY_RE       = /&([a-z#][a-z0-9]{1,31});/gi;
      let UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + '|' + ENTITY_RE.source, 'gi');

      let unescapeAll = (str) => {
        if (str.indexOf('\\') < 0 && str.indexOf('&') < 0) { return str; }

        return str.replace(UNESCAPE_ALL_RE, function (match, escaped, entity) {
          if (escaped) { return escaped; }
          return entities.decodeHTML5(match, entity);
        });
      }


      let langName = 'language-' + unescapeAll(info.split(/\s+/g)[0]);
      if (attributes.class) {
        attributes.class += langName;
      } else {
        attributes.class = langName;
      }
    }

    state.annotations.push({
      type: 'pre',
      start: state.content.length,
      end: state.content.length + token.content.length,
      attributes: {}
    });

    state.annotations.push({
      type: token.tag,
      start: state.content.length,
      end: state.content.length + token.content.length,
      attributes
    });

    state.content += token.content;
  },

  'text': (state, token) => {
    state.content += token.content;
  },

  'image': (state, token) => {

    let attributes: AttributeList = (token.attrs || []).reduce(state.convertAttributesToAttributeList, {});

    let fetchText = (token) => {
      let result = '';

      if (!token.children || token.children.length == 0) return result;

      for (let i = 0; i < token.children.length; i++) {
        let child = token.children[i];
        if (child.type === 'text') {
          result += child.content;
        } else if (child.type === 'image') {
          result += fetchText(child);
        }
      }

      return result;
    }

    attributes.alt = fetchText(token);

    state.annotations.push({
      type: token.tag,
      start: state.content.length,
      end: state.content.length,
      attributes
    });
  }
}

interface AttributeList {
  [key: string]: any;
}

interface TempAnnotation {
  type: string;
  start: number;
  __annotations: Annotation[];
  attributes: AttributeList;
}

export class Parser {

  markdown: string;
  content: string;
  annotations: Annotation[];

  private stack: TempAnnotation[];

  constructor(markdown: string) {
    this.markdown = markdown;
  }

  parse(): AtJSON {
    this.reset();

    let tokens = parser.parse(this.markdown, {});
    this.parseTokens(tokens);

    return new AtJSON({
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
    if (TAG_MAP[token.tag]) {
      token.tag = TAG_MAP[token.tag];
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

  handleInlineToken(token) {

    if (HANDLERS[token.type]) {

      HANDLERS[token.type](this, token);

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
    let attributes: AttributeList = (token.attrs || []).reduce(this.convertAttributesToAttributeList, {});

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

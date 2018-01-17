import { AtJSON } from '@atjson/core';
import * as entities from 'entities';
import * as MarkdownIt from 'markdown-it';
import Parser from './parser';
import { Token } from 'markdown-it';

export interface AttributeList {
  [key: string]: any;
}

export default class {

  static parser = MarkdownIt('commonmark');

  static TAG_MAP = {
    p: 'paragraph',
    img: 'image',
    ol: 'ordered-list',
    ul: 'unordered-list',
    li: 'list-item',
    a: 'link',
    em: 'italic',
    strong: 'bold'
  };

  private parser: Parser;

  constructor(markdown: string) {
    this.parser = new Parser(markdown, this);
  }

  toAtJSON(): AtJSON {
    return this.parser.parse();
  }

  hardbreak(state: Parser, token: Token) {
    state.annotations.push({
      type: token.tag,
      start: state.content.length,
      end: state.content.length,
      attributes: {}
    });
    state.content += '\n';
  }

  softbreak(state: Parser) {
    state.content += '\n';
  }

  hr(state: Parser, token: Token) {
    state.annotations.push({
      type: token.tag,
      start: state.content.length,
      end: state.content.length,
      attributes: {}
    });
  }

  code_block(state: Parser, token: Token) {
    let attributes: AttributeList = (token.attrs || []).reduce(state.convertAttributesToAttributeList, {});

    state.annotations.push({
      type: 'pre',
      start: state.content.length,
      end: state.content.length + token.content.length,
      attributes
    });

    state.annotations.push({
      type: token.tag,
      start: state.content.length,
      end: state.content.length + token.content.length,
      attributes: {}
    });

    state.content += token.content;
  }

  fence(state: Parser, token: Token) {
    let attributes: AttributeList = (token.attrs || []).reduce(state.convertAttributesToAttributeList, {});
    let info = token.info ? token.info.trim() : '';

    if (info) {
      let UNESCAPE_MD_RE  = /\\([!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~])/g;
      let ENTITY_RE       = /&([a-z#][a-z0-9]{1,31});/gi;
      let UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + '|' + ENTITY_RE.source, 'gi');

      let unescapeAll = (str: string) => {
        if (str.indexOf('\\') < 0 && str.indexOf('&') < 0) { return str; }

        return str.replace(UNESCAPE_ALL_RE, (match, escaped, entity) => {
          if (escaped) { return escaped; }
          return entities.decodeHTML5(match, entity);
        });
      };

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
  }

  text(state: Parser, token: Token) {
    state.content += token.content;
  }

  image(state: Parser, token: Token) {
    let attributes: AttributeList = (token.attrs || []).reduce(state.convertAttributesToAttributeList, {});

    let getAltText = (imageToken: Token, alt: string) => {
      if (imageToken.children) {
        imageToken.children.forEach(child => {
          if (child.type === 'text') {
            alt += child.content;
          } else if (child.type === 'image') {
            alt += getAltText(child, '');
          }
        });
      }
      return alt;
    };

    attributes.alt = getAltText(token, '');
    state.annotations.push({
      type: token.tag,
      start: state.content.length,
      end: state.content.length,
      attributes
    });
  }
}

import HTMLSource from '@atjson/source-html';
import * as MarkdownIt from 'markdown-it';

export default class extends HTMLSource {
  constructor(markdown: string) {
    let md = MarkdownIt('commonmark');
    super(md.render(markdown));
  }
}

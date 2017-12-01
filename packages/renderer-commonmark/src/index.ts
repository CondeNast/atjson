import { HIRNode } from '@atjson/hir';
import Renderer from '@atjson/renderer-hir';

export type Rule = (...args: any[]) => IterableIterator<string>;

export interface AnnotationLookup {
  [key: string]: Rule;
}

const MARKDOWN_RULES: AnnotationLookup = {
  /**
   * The root allows us to normalize the document
   * after all annotations have been rendered to
   * CommonMark.
   */
  *'root'(): IterableIterator<string> {
    let document = yield;
    return document.join('').trimRight();
  },

  /**
   * Bold text looks like **this** in Markdown.
   */
  *'bold'(): IterableIterator<string> {
    let text = yield;
    return `**${text.join('')}**`;
  },

  /**
   * > A block quote has `>` in front of every line
   * > it is on.
   * >
   * > It can also span multiple lines.
   */
  *'blockquote'(): IterableIterator<string> {
    let text: string[] = yield;
    let lines: string[] = text.join('').split('\n');
    let endOfQuote: number = lines.length;

    while (lines[endOfQuote - 1] === '') {
      endOfQuote--;
    }

    return lines.slice(0, endOfQuote).map(line => `> ${line}`).concat(lines.slice(endOfQuote)).join('\n') + '\n\n';
  },

  /**
   * # Headings have 6 levels, with a single `#` being the most important
   *
   * ###### and six `#` being the least important
   */
  *'heading'(props: { level: number }): IterableIterator<string> {
    let heading = yield;
    let level = new Array(props.level + 1).join('#');
    return `${level} ${heading.join('')}\n`;
  },

  /**
   * A horizontal rule separates sections of a story
   * ---
   * Into multiple sections.
   */
  *'horizontal-rule'(): IterableIterator<string> {
    return '---\n\n';
  },

  /**
   * Images are embedded like links, but with a `!` in front.
   * ![CommonMark](http://commonmark.org/images/markdown-mark.png)
   */
  *'image'(props: { alt: string, url: string }): IterableIterator<string> {
    return `![${props.alt}](${props.url})`;
  },

  /**
   * Italic text looks like *this* in Markdown.
   */
  *'italic'(): IterableIterator<string> {
    let text = yield;
    return `*${text.join('')}*`;
  },

  /**
   * A line break in Commonmark can be two white spaces at the end of the line  <--
   * or it can be a backslash at the end of the line\
   */
  *'line-break'(): IterableIterator<string> {
    return '  \n';
  },

  /**
   * A [link](http://commonmark.org) has the url right next to it in Markdown.
   */
  *'link'(props: { url: string }): IterableIterator<string> {
    let text = yield;
    return `[${text.join('')}](${props.url})`;
  },

  /**
   * A list item is part of an ordered list or an unordered list.
   */
  *'list-item'(this: any): IterableIterator<string> {
    let indent: string = '   '.repeat(this.indent);
    let item: string[] = yield;
    let indentedItem: string = item.join('').split('\n').map(line => indent + line).join('\n').trim();

    if (this.type === 'ordered-list') {
      return `${indent}${this.index++}. ${indentedItem}`;
    } else if (this.type === 'unordered-list') {
      return `${indent}- ${indentedItem}`;
    }

    return item;
  },

  /**
   * 1. An ordered list contains
   * 2. A number
   * 3. Of things with numbers preceding them
   */
  *'ordered-list'(this: any): IterableIterator<string> {
    this.pushScope({
      annotationLookup: this.annotationLookup,
      type: 'ordered-list',
      indent: (this.indent + 1) || 0,
      index: 1
    });
    let list = yield;
    this.popScope();

    let markdown = `${list.join('\n')}\n\n`;
    if (this.type === 'ordered-list' || this.type === 'unordered-list') {
      return `\n${markdown}`;
    }
    return markdown;
  },

  /**
   * - An ordered list contains
   * - A number
   * - Of things with dashes preceding them
   */
  *'unordered-list'(this: any): IterableIterator<string> {
    this.pushScope({
      annotationLookup: this.annotationLookup,
      type: 'unordered-list',
      indent: (this.indent + 1) || 0
    });
    let list = yield;
    this.popScope();

    let markdown = `${list.join('\n')}\n`;
    if (this.type === 'ordered-list' || this.type === 'unordered-list') {
      return `\n${markdown}`;
    }
    return markdown;
  },

  /**
   * A paragraph is the base unit of text.
   *
   * They are created by adding two newlines between
   * text.
   */
  *'paragraph'(): IterableIterator<string> {
    let rawText = yield;
    let text = rawText.join('');
    if (text.lastIndexOf('\n\n') === text.length - 2) {
      return text;
    }
    return `${text}\n\n`;
  }
};

export default class CommonmarkRenderer extends Renderer {
  annotationLookup: AnnotationLookup;

  constructor(annotationLookup?: AnnotationLookup) {
    super();
    this.annotationLookup = Object.assign(annotationLookup || {}, MARKDOWN_RULES);
  }

  registerRule(type: string, rule: Rule) {
    this.annotationLookup[type] = rule;
  }

  unregisterRule(type: string) {
    delete this.annotationLookup[type];
  }

  willRender() {
    this.pushScope({
      annotationLookup: this.annotationLookup
    });
  }

  *renderAnnotation(annotation: HIRNode) {
    let rule = this.annotationLookup[annotation.type];
    if (rule) {
      return yield* rule.call(this, annotation.attributes);
    } else {
      let text = yield;
      return text.join('');
    }
  }
}

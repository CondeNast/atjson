import Renderer from 'atjson-renderer';

interface AnnotationLookup {
  [key: string]: *(any): string;
}

const MARKDOWN_RULES = {
  /**
    The root allows us to normalize the document
    after all annotations have been rendered to
    CommonMark.
   */
  *root() {
    let document = yield;
    return document.join('').trimRight();
  },

  /**
    Bold text looks like **this** in Markdown.
   */
  *bold() {
    let text = yield;
    return `**${text.join('')}**`;
  },

  /**
    > A block quote has `>` in front of every line
    > it is on.
    >
    > It can also span multiple lines.
   */
  *blockquote() {
    let quote: string = yield;
    return quote.join('').split('\n').map((line) => `> ${line}`).join('\n');
  },

  /**
    # Headings have 6 levels, with a single `#` being the most important

    ###### and six `#` being the least important
   */
  *heading(props: { size: number }) {
    let hashes = new Array((props.size || 0) + 1).join('#');
    let heading = yield;
    return `${hashes} ${heading.join('')}`;
  },

  /**
    A horizontal rule separates sections of a story
    ---
    Into multiple sections.
   */
  *'horizontal-rule'() {
    return '\n---\n';
  },

  /**
    Images are embedded like links, but with a `!` in front.
    ![CommonMark](http://commonmark.org/images/markdown-mark.png)
   */
  *image(props: { alt: string, url: string }) {
    return `![${props.alt}](${props.url})`;
  },

  /**
    Italic text looks like *this* in Markdown.
   */
  *italic() {
    let text = yield;
    return `*${text.join('')}*`;
  },

  /**
    A line break in Commonmark can be two white spaces at the end of the line  
    or it can be a backslack at the end of the line\
   */
  *'line-break'() {
    return '  ';
  },

  /**
    A [link](http://commonmark.org) has the url right next to it in Markdown.
   */
  *link(props: { url: string }) {
    let text = yield;
    return `[${text.join('')}](${props.url})`;
  },

  /**
    A list item is part of an ordered list or an unordered list.
   */
  *'list-item'() {
    let indent: string = new Array(this.indent + 1).join('   ');
    let item: string = yield;
    let indentedItem = item.join('').split('\n').map((line) => indent + line).join('\n').trim();

    if (this.type === 'ordered-list') {
      console.log('li', `${indent}${this.index}. ${indentedItem}\n`);
      return `${indent}${this.index++}. ${indentedItem}`;
    } else if (this.type === 'unordered-list') {
      console.log('li', `${indent}- ${indentedItem}\n`);
      return `${indent}- ${indentedItem}`;
    }
    return item;
  },

  /**
    1. An ordered list contains
    2. A number
    3. Of things with numbers preceding them
   */
  *'ordered-list'() {
    this.pushScope({
      annotationLookup: this.annotationLookup,
      type: 'ordered-list',
      indent: (this.indent + 1) || 0,
      index: 1
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
    - An ordered list contains
    - A number
    - Of things with dashes preceding them
   */
  *'unordered-list'() {
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
    A paragraph is the base unit of text.

    They are created by adding two newlines between
    text.
   */
  *paragraph() {
    let text = yield;
    return `${text.join('')}\n\n`;
  }
};

export default class CommonmarkRenderer extends Renderer {
  annotationLookup: AnnotationLookup

  constructor(annotationLookup: AnnotationLookup) {
    super();
    this.annotationLookup = Object.assign(annotationLookup || {}, MARKDOWN_RULES);
  }

  registerRule(type: string, rule: *(any): string) {
    this.annotationLookup[type] = rule;
  }

  unregisterRule(type: string) {
    this.annotationLookup[type] = null;
  }

  willRender() {
    this.pushScope({
      annotationLookup: this.annotationLookup
    });
  }

  *renderAnnotation (annotation) {
    let rule = this.annotationLookup[annotation.type];
    if (rule) {
      return yield* rule.call(this, annotation.attributes);
    } else {
      console.error(`No rule found for "${annotation.type}"`);
      return `yield.join('')`;
    }
  }
});

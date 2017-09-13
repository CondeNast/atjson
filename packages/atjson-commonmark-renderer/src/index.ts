import TextRenderer from 'atjson-text-renderer';

export default new TextRenderer({

  /**
    The root allows us to normalize the document
    after all annotations have been rendered to
    CommonMark.
   */
  *root() {
    let document = yield;
    return document.trimRight();
  },

  /**
    Bold text looks like **this** in Markdown.
   */
  *bold() {
    return `**${yield}**`;
  },

  /**
    > A block quote has `>` in front of every line
    > it is on.
    >
    > It can also span multiple lines.
   */
  *blockquote() {
    let quote: string = yield;
    return quote.split('\n').map((line) => `> ${line}`).join('\n');
  },

  /**
    # Headings have 6 levels, with a single `#` being the most important

    ###### and six `#` being the least important
   */
  *heading(props: { size: number }) {
    let hashes = new Array((props.size || 0) + 1).join('#');
    return `${hashes} ${yield}`;
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
    return `*${yield}*`;
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
    return `[${yield}](${props.url})`;
  },

  /**
    A list item is part of an ordered list or an unordered list.
   */
  *'list-item'() {
    let indent: string = new Array(this.indent + 1).join('   ');
    let item: string = yield;
    let indentedItem = item.split('\n').map((line) => indent + line).join('\n').trim();

    if (this.type === 'ordered-list') {
      console.log('li', `${indent}${this.index}. ${indentedItem}\n`);
      return `${indent}${this.index++}. ${indentedItem}\n`;
    } else if (this.type === 'unordered-list') {
      console.log('li', `${indent}- ${indentedItem}\n`);
      return `${indent}- ${indentedItem}\n`;
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
      type: 'ordered-list',
      indent: (this.indent + 1) || 0,
      index: 1
    });
    let list = yield;
    this.popScope();
    console.log('ol', `"${list}\n"`);
    return `${list}\n`;
  },

  /**
    - An ordered list contains
    - A number
    - Of things with dashes preceding them
   */
  *'unordered-list'() {
    this.pushScope({
      type: 'unordered-list',
      indent: (this.indent + 1) || 0
    });
    let list = yield;
    this.popScope();
    return list;
  },

  /**
    A paragraph is the base unit of text.

    They are created by adding two newlines between
    text.
   */
  *paragraph() {
    return `${yield}\n\n`;
  }
});

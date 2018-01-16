import { HIRNode } from '@atjson/hir';
import Renderer, { State } from '@atjson/renderer-hir';

export function* split() {
  let rawText = yield;
  let text = rawText.join('');
  let start = 0;
  let end = text.length;

  while (text[start] === ' ' && start < end) { start++; }
  while (text[end - 1] === ' ' && end > start) { end--; }

  return [
    text.slice(0, start),
    text.slice(start, end),
    text.slice(end)
  ];
}

export default class CommonmarkRenderer extends Renderer {

  /**
   * The root allows us to normalize the document
   * after all annotations have been rendered to
   * CommonMark.
   */
  *'root'(): IterableIterator<string> {
    let document = yield;
    return document.join('').trimRight();
  }

  /**
   * Bold text looks like **this** in Markdown.
   */
  *'bold'(): IterableIterator<string> {
    let [before, text, after] = yield* split();
    return `${before}**${text}**${after}`;
  }

  /**
   * > A block quote has `>` in front of every line
   * > it is on.
   * >
   * > It can also span multiple lines.
   */
  *'blockquote'(): IterableIterator<string> {
    let text: string[] = yield;
    let lines: string[] = text.join('').split('\n');
    let endOfQuote = lines.length;
    let startOfQuote = 0;

    while (lines[startOfQuote].match(/^(\s)*$/)) startOfQuote++;
    while (lines[endOfQuote - 1].match(/^(\s)*$/)) endOfQuote--;

    return [
      ...lines.slice(startOfQuote, endOfQuote).map(line => `> ${line}`),
      '\n'
    ].join('\n');
  }

  /**
   * # Headings have 6 levels, with a single `#` being the most important
   *
   * ###### and six `#` being the least important
   */
  *'heading'(props: { level: number }): IterableIterator<string> {
    let heading = yield;
    let level = new Array(props.level + 1).join('#');
    return `${level} ${heading.join('')}\n\n`;
  }

  /**
   * A horizontal rule separates sections of a story
   * ---
   * Into multiple sections.
   */
  *'horizontal-rule'(): IterableIterator<string> {
    return '---\n\n';
  }

  /**
   * Images are embedded like links, but with a `!` in front.
   * ![CommonMark](http://commonmark.org/images/markdown-mark.png)
   */
  *'image'(props: { alt: string, url: string }): IterableIterator<string> {
    return `![${props.alt}](${props.url})`;
  }

  /**
   * Italic text looks like *this* in Markdown.
   */
  *'italic'(): IterableIterator<string> {
    let [before, text, after] = yield* split();
    return `${before}*${text}*${after}`;
  }

  /**
   * A line break in Commonmark can be two white spaces at the end of the line  <--
   * or it can be a backslash at the end of the line\
   */
  *'line-break'(): IterableIterator<string> {
    return '  \n';
  }

  /**
   * A [link](http://commonmark.org) has the url right next to it in Markdown.
   */
  *'link'(props: { href: string }): IterableIterator<string> {
    let [before, text, after] = yield* split();
    return `${before}[${text}](${props.href})${after}`;
  }

  /**
   * A list item is part of an ordered list or an unordered list.
   */
  *'list-item'(_, state: State): IterableIterator<string> {
    let indent: string = '   '.repeat(state.get('indent'));
    let rawItem: string[] = yield;
    let index: number = state.get('index');
    let item: string = rawItem.join('').split('\n').map(line => indent + line).join('\n').trim();

    if (state.get('type') === 'ordered-list') {
      item = `${indent}${index}. ${item}`;
      state.set('index', index + 1);
    } else if (state.get('type') === 'unordered-list') {
      item = `${indent}- ${item}`;
    }

    return item;
  }

  /**
   * 1. An ordered list contains
   * 2. A number
   * 3. Of things with numbers preceding them
   */
  *'ordered-list'(_, state: State): IterableIterator<string> {
    let indent = state.get('indent');
    if (indent == null) {
      indent = -1;
    }
    state.push({
      type: 'ordered-list',
      indent: indent + 1,
      index: 1
    });
    let list = yield;
    state.pop();

    let markdown = `${list.join('\n')}\n\n`;
    if (state.get('type') === 'ordered-list' ||
        state.get('type') === 'unordered-list') {
      return `\n${markdown}`;
    }
    return markdown;
  }

  /**
   * - An ordered list contains
   * - A number
   * - Of things with dashes preceding them
   */
  *'unordered-list'(_, state: State): IterableIterator<string> {
    let indent = state.get('indent');
    if (indent == null) {
      indent = -1;
    }

    state.push({
      type: 'unordered-list',
      indent: indent + 1,
    });
    let list = yield;
    state.pop();

    let markdown = `${list.join('\n')}\n\n`;
    if (state.get('type') === 'ordered-list' ||
        state.get('type') === 'unordered-list') {
      return `\n${markdown}`;
    }
    return markdown;
  }

  /**
   * A paragraph is the base unit of text.
   *
   * They are created by adding two newlines between
   * text.
   */
  *'paragraph'(): IterableIterator<string> {
    let rawText = yield;
    let text = rawText.join('');
    if (text.lastIndexOf('\n\n') === Math.max(text.length - 2, 0)) {
      return text;
    }
    return `${text}\n\n`;
  }

  *renderAnnotation(annotation: HIRNode, state: State) {
    let rule = this[annotation.type];
    if (rule) {
      return yield* this[annotation.type](annotation.attributes, state);
    } else {
      let text = yield;
      return text.join('');
    }
  }
}

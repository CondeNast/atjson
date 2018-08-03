import Document from '@atjson/document';
import { HIR, HIRNode } from '@atjson/hir';

export function* split(): Iterable<any> {
  let text = yield;
  let start = 0;
  let end = text.length;
  let match;

  while ((match = text.slice(start).match(/^(\s|&nbsp;){1}/)) && start < end) {
    start += match[1].length;
  }
  while ((match = text.slice(0, end).match(/(\s|&nbsp;){1}$/)) && end > start) {
    end -= match[1].length;
  }

  return [
    text.slice(0, start),
    text.slice(start, end),
    text.slice(end)
  ];
}

export type CodeStyle = 'block' | 'inline' | 'fence';

// http://spec.commonmark.org/0.28/#backslash-escapes
function escapePunctuation(text: string) {
  return text.replace(/([#$%'"!()*+,=?@\\\[\]\^_`{|}~-])/g, '\\$1')
             .replace(/(\d+)\./g, '$1\\.')
             .replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;');
}

function escapeAttribute(text: string) {
  return text.replace(/\(/g, '\\(')
             .replace(/\)/g, '\\)');
}

function getNumberOfRequiredBackticks(text: string) {
  let index = 0;
  let counts = [0];
  for (let i = 0, len = text.length; i < len; i++) {
    if (text[i] === '`') {
      counts[index] = counts[index] + 1;
    } else if (counts[index] !== 0) {
      counts.push(0);
      index++;
    }
  }

  return counts.sort().reduce((result, count) => {
    if (count === result) {
      return result + 1;
    }
    return result;
  }, 1);
}

export interface Annotation {
  type: string;
  attributes: any;
  previous: Annotation | null;
  next: Annotation | null;
  parent: Annotation | null;
  text?: string;
  children: Annotation[];
}

function hirNodeToMarkdownNode(node: HIRNode, parent: Annotation | null): Annotation {
  let markdownNode: Annotation = {
    type: node.type,
    attributes: node.attributes || {},
    parent,
    previous: null,
    next: null,
    text: node.text,
    children: []
  };

  markdownNode.children.push(...node.children().map((childNode: HIRNode) => {
    return hirNodeToMarkdownNode(childNode, markdownNode);
  }));

  return markdownNode;
}

function render(renderer: CommonmarkRenderer, node: Annotation, index: number): string {
  if (node.parent && index > 0) {
    node.previous = node.parent.children[index - 1];
  }

  if (node.parent && index < node.parent.children.length) {
    node.next = node.parent.children[index + 1];
  }

  node.attributes = Object.keys(node.attributes).reduce((attrs: any, key: string) => {
    let value = node.attributes[key];
    if (value instanceof HIR) {
      attrs[key] = render(renderer, hirNodeToMarkdownNode(value.rootNode, null), -1);
    } else {
      attrs[key] = value;
    }
    return attrs;
  }, {});

  let factory = (renderer as any)[node.type];
  let generator;
  if (factory) {
    generator = factory.call(renderer, node);
    let result = generator.next();
    if (result.done) {
      return result.value;
    }
  }

  let fragment = node.children.map((childNode: Annotation, idx: number) => {
    if (childNode.type === 'text' && typeof childNode.text === 'string') {
      return renderer.text(childNode.text);
    } else {
      return render(renderer, childNode, idx);
    }
  }).join('');

  if (generator) {
    return generator.next(fragment).value;
  } else {
    return fragment;
  }
}

export default class CommonmarkRenderer {

  state: any;

  constructor() {
    this.state = {};
  }

  text(text: string) {
    if (this.state.isPreformatted) {
      return text;
    }
    return escapePunctuation(text).replace(/\u00A0/gu, '&nbsp;');
  }

  /**
   * Bold text looks like **this** in Markdown.
   *
   * Asterisks are used here because they can split
   * words; underscores cannot split words.
   */
  *'bold'(node: Annotation): Iterable<any> {
    let [before, text, after] = yield* split();
    if (text.length === 0) {
      return before + after;
    } else {
      if (node.parent && !node.previous && !node.next &&
          node.parent.type === 'italic') {
        return `${before}__${text}__${after}`;
      }
      return `${before}**${text}**${after}`;
    }
  }

  /**
   * > A block quote has `>` in front of every line
   * > it is on.
   * >
   * > It can also span multiple lines.
   */
  *'blockquote'(): Iterable<any> {
    let text = yield;
    let lines: string[] = text.split('\n');
    let endOfQuote = lines.length;
    let startOfQuote = 0;

    while (startOfQuote < endOfQuote - 1 && lines[startOfQuote].match(/^\s*$/)) startOfQuote++;
    while (endOfQuote > startOfQuote + 1 && lines[endOfQuote - 1].match(/^\s*$/)) endOfQuote--;

    let quote = lines.slice(startOfQuote, endOfQuote).map(line => `> ${line}`).join('\n') + '\n';

    if (!this.state.tight) {
      quote += '\n';
    }
    return quote;
  }

  /**
   * # Headings have 6 levels, with a single `#` being the most important
   *
   * ###### and six `#` being the least important
   *
   * If the heading spans multiple lines, then we will use the underline
   * style, using a series of `=` or `-` markers. This only works for
   * headings of level 1 or 2, so any other level will be broken.
   */
  *'heading'(node: Annotation): Iterable<any> {
    let heading = yield;
    let level = new Array(node.attributes.level + 1).join('#');

    // Multiline headings are supported for level 1 and 2
    if (heading.indexOf('\n') !== -1) {
      if (node.attributes.level === 1) {
        return `${heading}\n====\n`;
      } else if (node.attributes.level === 2) {
        return `${heading}\n----\n`;
      }
    }
    return `${level} ${heading}\n`;
  }

  /**
   * A horizontal rule separates sections of a story
   * ***
   * Into multiple sections.
   */
  *'horizontal-rule'(): Iterable<any> {
    return '***\n';
  }

  /**
   * Images are embedded like links, but with a `!` in front.
   * ![CommonMark](http://commonmark.org/images/markdown-mark.png)
   */
  *'image'(node: Annotation): Iterable<any> {
    if (node.attributes.title) {
      let title = node.attributes.title.replace(/"/g, '\\"');
      return `![${node.attributes.description}](${node.attributes.url} "${title}")`;
    }
    return `![${node.attributes.description}](${node.attributes.url})`;
  }

  /**
   * Italic text looks like *this* in Markdown.
   */
  *'italic'(node: Annotation): Iterable<any> {
    // This adds support for strong emphasis (per Commonmark)
    // Strong emphasis includes _*two*_ emphasis markers around text.
    let state = Object.assign({}, this.state);
    this.state.isItalicized = true;

    let [before, text, after] = yield* split();
    this.state = state;

    if (text.length === 0) {
      return before + after;
    } else {
      let markup = state.isItalicized ? '_' : '*';
      if (node.parent && !node.previous && !node.next &&
          node.parent.type === 'bold') {
        markup = '_';
      }
      return `${before}${markup}${text}${markup}${after}`;
    }
  }

  /**
   * A line break in Commonmark can be two white spaces at the end of the line  <--
   * or it can be a backslash at the end of the line\
   */
  *'line-break'(): Iterable<any> {
    return '  \n';
  }

  /**
   * A [link](http://commonmark.org) has the url right next to it in Markdown.
   */
  *'link'(node: Annotation): Iterable<any> {
    let [before, text, after] = yield* split();
    let url = escapeAttribute(node.attributes.url);
    if (node.attributes.title) {
      let title = node.attributes.title.replace(/"/g, '\\"');
      return `${before}[${text}](${url} "${title}")${after}`;
    }
    return `${before}[${text}](${url})${after}`;
  }

  /**
   * A `code` span can be inline or as a block:
   *
   * ```js
   * function () {}
   * ```
   */
  *'code'(node: Annotation): Iterable<any> {
    let state = Object.assign({}, this.state);
    Object.assign(this.state, { isPreformatted: true, htmlSafe: true });

    let code = yield;
    this.state = state;

    if (node.attributes.style === 'fence') {
      code = '\n' + code;
      let info = node.attributes.info || '';
      let newlines = '\n';
      if (this.state.isList && node.next) {
        newlines += '\n';
      }

      if (code.indexOf('```') !== -1) {
        return `~~~${info}${code}~~~${newlines}`;
      } else {
        return `\`\`\`${info}${code}\`\`\`${newlines}`;
      }
    } else if (node.attributes.style === 'block') {
      return code.split('\n').map((line: string) => `    ${line}`).join('\n') + '\n';
    } else {
      // MarkdownIt strips all leading and trailing whitespace from code blocks,
      // which means that we get an empty string for a single whitespace (` `).
      if (code.length === 0) {
        return '` `';

      // We need to properly escape backticks inside of code blocks
      // by using variable numbers of backticks.
      } else {
        let backticks = '`'.repeat(getNumberOfRequiredBackticks(code));
        return `${backticks}${code}${backticks}`;
      }
    }
  }

  *'html'(node: Annotation): Iterable<any> {
    let state = Object.assign({}, this.state);
    Object.assign(this.state, { isPreformatted: true, htmlSafe: true });

    let html = yield;

    this.state = state;

    if (node.attributes.type === 'block') {
      return html + '\n';
    }
    return html;
  }

  /**
   * A list item is part of an ordered list or an unordered list.
   */
  *'list-item'(): Iterable<any> {
    let digit: number = this.state.digit;
    let delimiter = this.state.delimiter;
    let marker: string = delimiter;
    if (this.state.type === 'numbered') {
      marker = `${digit}${delimiter}`;
      this.state.digit++;
    }

    let indent = ' '.repeat(marker.length + 1);
    let item: string = yield;
    let firstCharacter = 0;
    while (item[firstCharacter] === ' ') firstCharacter++;

    let lines: string[] = item.split('\n');
    lines.push((lines.pop() || '').replace(/[ ]+$/, ''));
    lines.unshift((lines.shift() || '').replace(/^[ ]+/, ''));
    let [first, ...rest] = lines;

    item = ' '.repeat(firstCharacter) + first + '\n' + rest.map(line => indent + line).join('\n').replace(/[ ]+$/, '');

    if (this.state.tight) {
      item = item.replace(/([ \n])+$/, '\n');
    }

    // Code blocks using spaces can follow lists,
    // however, they will be included in the list
    // if we don't adjust spacing on the list item
    // to force the code block outside of the list
    // See http://spec.commonmark.org/dingus/?text=%20-%20%20%20hello%0A%0A%20%20%20%20I%27m%20a%20code%20block%20_outside_%20the%20list%0A
    if (this.state.hasCodeBlockFollowing) {
      return ` ${marker}    ${item}`;
    }
    return `${marker} ${item}`;
  }

  /**
   * 1. An ordered list contains
   * 2. A number
   * 3. Of things with numbers preceding them
   */
  *'list'(node: Annotation): Iterable<any> {
    let start = 1;

    if (node.attributes.startsAt != null) {
      start = node.attributes.startsAt;
    }

    let delimiter = '';
    if (node.attributes.type === 'numbered') {
      delimiter = '.';

      if (node.previous &&
          node.previous.type === 'list' &&
          node.previous.attributes.type === 'numbered' &&
          node.previous.attributes.delimiter === '.') {
        delimiter = ')';
      }
    } else if (node.attributes.type === 'bulleted') {
      delimiter = '-';

      if (node.previous &&
          node.previous.type === 'list' &&
          node.previous.attributes.type === 'bulleted' &&
          node.previous.attributes.delimiter === '-') {
        delimiter = '+';
      }
    }
    node.attributes.delimiter = delimiter;

    let state = Object.assign({}, this.state);

    // Handle indendation for code blocks that immediately follow a list.
    let hasCodeBlockFollowing = node.next &&
                                node.next.type === 'code' &&
                                node.next.attributes.style === 'block';
    Object.assign(this.state, {
      isList: true,
      type: node.attributes.type,
      digit: start,
      delimiter,
      tight: node.attributes.tight,
      hasCodeBlockFollowing
    });

    let list = yield;

    this.state = state;
    return list + '\n';
  }

  /**
   * Paragraphs are delimited by two or more newlines in markdown.
   */
  *'paragraph'(): Iterable<any> {
    let text = yield;

    // Remove leading and trailing newlines from paragraphs
    // with text in them.
    // This ensures that paragraphs preceded with tabs or spaces
    // will not turn into code blocks
    if (!text.match(/^\s+$/g)) {
      text = text.replace(/^\s+/g, '').replace(/\s+$/g, '');
    }

    if (this.state.tight) {
      return text + '\n';
    }
    return text + '\n\n';
  }

  render(document: Document | HIR): string {
    let graph;
    if (document instanceof HIR) {
      graph = document;
    } else {
      graph = new HIR(document);
    }

    return render(this, hirNodeToMarkdownNode(graph.rootNode, null), -1);
  }
}

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

type CodeStyle = 'block' | 'inline' | 'fence';

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

export default class CommonmarkRenderer extends Renderer {

  renderText(text: string, state: State) {
    if (state.get('isPreformatted')) {
      return text;
    }
    return escapePunctuation(text).replace(/\u00A0/gu, '&nbsp;');
  }

  /**
   * The root allows us to normalize the document
   * after all annotations have been rendered to
   * CommonMark.
   */
  *'root'(): IterableIterator<string> {
    let document = yield;
    return document.join('');
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
  *'blockquote'(_, state: State): IterableIterator<string> {
    let text: string[] = yield;
    let lines: string[] = text.join('').split('\n');
    let endOfQuote = lines.length;
    let startOfQuote = 0;

    while (startOfQuote < endOfQuote - 1 && lines[startOfQuote].match(/^(\s)*$/)) startOfQuote++;
    while (endOfQuote > startOfQuote + 1 && lines[endOfQuote - 1].match(/^(\s)*$/)) endOfQuote--;

    if (state.get('isList')) {
      return lines.slice(startOfQuote, endOfQuote).map(line => `> ${line}`).join('\n') + '\n';
    }
    return lines.slice(startOfQuote, endOfQuote).map(line => `> ${line}`).join('\n') + '\n\n';
  }

  /**
   * # Headings have 6 levels, with a single `#` being the most important
   *
   * ###### and six `#` being the least important
   */
  *'heading'(props: { level: number }): IterableIterator<string> {
    let text = yield;
    let level = new Array(props.level + 1).join('#');
    let heading = text.join('');

    // Multiline headings are supported for level 1 and 2
    if (heading.indexOf('\n') !== -1) {
      if (props.level === 1) {
        return `${heading}\n====\n`;
      } else if (props.level === 2) {
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
  *'horizontal-rule'(): IterableIterator<string> {
    return '***\n';
  }

  /**
   * Images are embedded like links, but with a `!` in front.
   * ![CommonMark](http://commonmark.org/images/markdown-mark.png)
   */
  *'image'(props: { alt: string, title?: string, url: string }): IterableIterator<string> {
    if (props.title) {
      let title = props.title.replace(/"/g, '\\"');
      return `![${props.alt}](${props.url} "${title}")`;
    }
    return `![${props.alt}](${props.url})`;
  }

  /**
   * Italic text looks like *this* in Markdown.
   */
  *'italic'(_, state: State): IterableIterator<string> {
    let isItalicized = state.get('isItalicized');
    state.set('isItalicized', true);
    let [before, text, after] = yield* split();
    state.set('isItalicized', isItalicized);
    let markup = isItalicized ? '_' : '*';
    return `${before}${markup}${text}${markup}${after}`;
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
  *'link'(props: { href: string, title?: string }): IterableIterator<string> {
    let [before, text, after] = yield* split();
    let href = escapeAttribute(props.href);
    if (props.title) {
      let title = props.title.replace(/"/g, '\\"');
      return `${before}[${text}](${href} "${title}")${after}`;
    }
    return `${before}[${text}](${href})${after}`;
  }

  /**
   * A `code` span can be inline or as a block:
   *
   * ```js
   * function () {}
   * ```
   */
  *'code'(props: { style: CodeStyle, info?: string }, state: State): IterableIterator<string> {
    state.push({ isPreformatted: true, htmlSafe: false });
    let text = yield;
    state.pop();
    let code = text.join('');

    if (props.style === 'fence') {
      code = '\n' + code;
      let info = props.info || '';
      let newlines = '\n';
      if (state.get('isList') && state.get('nextAnnotation')) {
        newlines += '\n';
      }

      if (code.indexOf('```') !== -1) {
        return `~~~${info}${code}~~~${newlines}`;
      } else {
        return `\`\`\`${info}${code}\`\`\`${newlines}`;
      }
    } else if (props.style === 'block') {
      return code.split('\n').map(line => `    ${line}`).join('\n') + '\n';
    } else {
      // Inline code must be at least 1 letter
      if (code.length === 0) {
        return '` `';
      } else {
        let backticks = '`'.repeat(getNumberOfRequiredBackticks(code));
        return `${backticks}${code}${backticks}`;
      }
    }
  }

  *'html'(props: { type: string }, state: State): IterableIterator<string> {
    state.push({ isPreformatted: true, htmlSafe: true });
    let text = yield;
    state.pop();
    let html = text.join('');
    if (props.type === 'block') {
      return html + '\n';
    }
    return html;
  }

  /**
   * A list item is part of an ordered list or an unordered list.
   */
  *'list-item'(_, state: State): IterableIterator<string> {
    let digit: number = state.get('digit');
    let delimiter = state.get('delimiter');
    let marker: string = delimiter;
    if (state.get('type') === 'numbered') {
      marker = `${digit}${delimiter}`;
      state.set('digit', digit + 1);
    }
    let indent = ' '.repeat(marker.length + 1);
    let text: string[] = yield;
    let item: string = text.join('');
    let firstCharacter = 0;
    while (item[firstCharacter] === ' ') firstCharacter++;
    let lines = item.split('\n');
    lines.push(lines.pop().replace(/( )+$/, ''));
    lines.unshift(lines.shift().replace(/^( )+/, ''));
    let [first, ...rest] = lines;

    item = ' '.repeat(firstCharacter) + first + '\n' + rest.map(line => indent + line).join('\n').replace(/( )+$/, '');
    if (state.get('hasCodeBlockFollowing')) {
      return ` ${marker}    ${item}`;
    }
    return `${marker} ${item}`;
  }

  /**
   * 1. An ordered list contains
   * 2. A number
   * 3. Of things with numbers preceding them
   */
  *'ordered-list'(props: { start?: number, tight: boolean }, state: State): IterableIterator<string> {
    let start = 1;

    if (props && props.start != null) {
      start = props.start;
    }
    let delimiter = '.';
    if (state.get('previous.type') === 'numbered' && state.get('previous.delimiter') === '.') {
      delimiter = ')';
    }

    // Handle indendation for code blocks that immediately follow
    // a list.
    let hasCodeBlockFollowing = state.get('nextAnnotation.type') === 'code' &&
                                state.get('nextAnnotation.attributes.style') === 'block');

    state.push({
      isList: true,
      type: 'numbered',
      digit: start,
      previous: state.get('previous'),
      delimiter,
      hasCodeBlockFollowing,
      tight: props && props.tight
    });
    let list = yield;
    state.pop();

    if (props && props.tight) {
      list = list.map(item => item.replace(/([ \n])+$/, '\n');
    }

    state.set('previous', {
      isList: true,
      type: 'numbered',
      delimiter
    });

    return list.join('') + '\n';
  }

  /**
   * - An unordered list contains
   * - A number
   * - Of things with dashes preceding them
   */
  *'unordered-list'(props: { tight: boolean }, state: State): IterableIterator<string> {
    let delimiter = '-';
    if (state.get('previous.type') === 'bulleted' && state.get('previous.delimiter') === '-') {
      delimiter = '+';
    }

    // Handle indendation for code blocks that immediately follow
    // a list.
    let hasCodeBlockFollowing = state.get('nextAnnotation.type') === 'code' &&
                                state.get('nextAnnotation.attributes.style') === 'block');

    state.push({
      isList: true,
      type: 'bulleted',
      previous: state.get('previous'),
      delimiter,
      tight: props && props.tight,
      hasCodeBlockFollowing
    });

    let list = yield;
    state.pop();

    state.set('previous', {
      isList: true,
      type: 'bulleted',
      delimiter
    });

    if (props && props.tight) {
      list = list.map(item => item.replace(/([ \n])+$/, '\n');
    }

    return list.join('') + '\n';
  }

  /**
   * Paragraphs are delimited by two or more newlines in markdown.
   */
  *'paragraph'(_, state: State): IterableIterator<string> {
    let text = yield;
    if (state.get('tight')) {
      return text.join('') + '\n';
    }
    return text.join('') + '\n\n';
  }
}

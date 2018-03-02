import { HIRNode } from '@atjson/hir';
import Renderer, { State } from '@atjson/renderer-hir';

export function* split(): IterableIterator<string> {
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
   *
   * Asterisks are used here because they can split
   * words; underscores cannot split words.
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
  *'quotation'(_: any, state: State): IterableIterator<string> {
    let text: string[] = yield;
    let lines: string[] = text.join('').split('\n');
    let endOfQuote = lines.length;
    let startOfQuote = 0;

    while (startOfQuote < endOfQuote - 1 && lines[startOfQuote].match(/^\s*$/)) startOfQuote++;
    while (endOfQuote > startOfQuote + 1 && lines[endOfQuote - 1].match(/^\s*$/)) endOfQuote--;

    let quote = lines.slice(startOfQuote, endOfQuote).map(line => `> ${line}`).join('\n') + '\n';

    if (!state.get('tight')) {
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
  *'image'(props: { description: string, title?: string, url: string }): IterableIterator<string> {
    if (props.title) {
      let title = props.title.replace(/"/g, '\\"');
      return `![${props.description}](${props.url} "${title}")`;
    }
    return `![${props.description}](${props.url})`;
  }

  /**
   * Italic text looks like *this* in Markdown.
   */
  *'italic'(_: any, state: State): IterableIterator<string> {
    // This adds support for strong emphasis (per Commonmark)
    // Strong emphasis includes _*two*_ emphasis markers around text.
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
  *'link'(props: { url: string, title?: string }): IterableIterator<string> {
    let [before, text, after] = yield* split();
    let url = escapeAttribute(props.url);
    if (props.title) {
      let title = props.title.replace(/"/g, '\\"');
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
  *'list-item'(_: any, state: State): IterableIterator<string> {
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

    let lines: string[] = item.split('\n');
    lines.push((lines.pop() || '').replace(/[ ]+$/, ''));
    lines.unshift((lines.shift() || '').replace(/^[ ]+/, ''));
    let [first, ...rest] = lines;

    item = ' '.repeat(firstCharacter) + first + '\n' + rest.map(line => indent + line).join('\n').replace(/[ ]+$/, '');

    // Code blocks using spaces can follow lists,
    // however, they will be included in the list
    // if we don't adjust spacing on the list item
    // to force the code block outside of the list
    // See http://spec.commonmark.org/dingus/?text=%20-%20%20%20hello%0A%0A%20%20%20%20I%27m%20a%20code%20block%20_outside_%20the%20list%0A
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
  *'list'(props: { type: string, startsAt?: number, tight: boolean }, state: State): IterableIterator<string> {
    let start = 1;

    if (props && props.startsAt != null) {
      start = props.startsAt;
    }

    let delimiter = '';
    if (props.type === 'numbered') {
      delimiter = '.';

      if (state.get('previous.type') === 'numbered' &&
          state.get('previous.delimiter') === '.') {
        delimiter = ')';
      }
    } else if (props.type === 'bulleted') {
      delimiter = '-';

      if (state.get('previous.type') === 'bulleted' &&
          state.get('previous.delimiter') === '-') {
        delimiter = '+';
      }
    }

    // Handle indendation for code blocks that immediately follow
    // a list.
    let hasCodeBlockFollowing = state.get('nextAnnotation.type') === 'code' &&
                                state.get('nextAnnotation.attributes.style') === 'block';

    state.push({
      isList: true,
      type: props.type,
      digit: start,
      previous: state.get('previous'),
      delimiter,
      hasCodeBlockFollowing,
      tight: props && props.tight
    });
    let list: string[] = yield;
    state.pop();

    if (props && props.tight) {
      list = list.map(item => item.replace(/([ \n])+$/, '\n'));
    }

    state.set('previous', {
      isList: true,
      type: props.type,
      delimiter
    });

    return list.join('') + '\n';
  }

  /**
   * Paragraphs are delimited by two or more newlines in markdown.
   */
  *'paragraph'(_: any, state: State): IterableIterator<string> {
    let text = yield;
    if (state.get('tight')) {
      return text.join('') + '\n';
    }
    return text.join('') + '\n\n';
  }
}

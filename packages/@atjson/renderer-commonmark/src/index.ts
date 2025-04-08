import Document from "@atjson/document";
import {
  Bold,
  CodeBlock,
  DataSet,
  HTML,
  Heading,
  Image,
  Italic,
  Link,
  List,
  Paragraph,
  Table,
  TextAlignment,
} from "@atjson/offset-annotations";
import Renderer, { Context } from "@atjson/renderer-hir";
import type { Block, Mark } from "@atjson/document";
import {
  BEGINNING_WHITESPACE,
  BEGINNING_WHITESPACE_PUNCTUATION,
  ENDING_WHITESPACE,
  ENDING_WHITESPACE_PUNCTUATION,
  LEADING_MD_SPACES,
  TRAILING_MD_SPACES,
  UNMATCHED_TRAILING_ESCAPE_SEQUENCES,
  WHITESPACE_PUNCTUATION,
} from "./lib/punctuation";
export * from "./lib/punctuation";

export function* splitDelimiterRuns(
  context: Context,
  options: { escapeHtmlEntities: boolean; ignoreInnerMark?: boolean } = {
    escapeHtmlEntities: true,
    ignoreInnerMark: false,
  }
): Generator<void, [string, string, string], string[]> {
  let rawText = yield;
  let text = rawText.map(unescapeEntities).join("");
  let start = 0;
  let end = text.length;
  let match;

  let child = context.children.length === 1 ? context.children[0] : null;
  if (
    child &&
    typeof child !== "string" &&
    "range" in child &&
    !options.ignoreInnerMark &&
    (child.type === Bold.type || child.type === Italic.type)
  ) {
    return ["", text, ""] as [string, string, string];
  }

  while (start < end) {
    match = text.slice(start).match(BEGINNING_WHITESPACE_PUNCTUATION);
    if (!match) break;
    if (match[2]) {
      start += match[2].length;
    } else if (match[3]) {
      let previousCharacter =
        typeof context.previous === "string"
          ? context.previous[context.previous.length - 1]
          : "";
      if (
        start === 0 &&
        previousCharacter &&
        !previousCharacter.match(WHITESPACE_PUNCTUATION)
      ) {
        start += match[3].length;
      } else {
        break;
      }
    }
  }
  while (end > start) {
    match = text.slice(0, end).match(ENDING_WHITESPACE_PUNCTUATION);
    if (!match) break;
    if (match[4]) {
      end -= match[4].length;
    } else if (match[5]) {
      // never include single backslash as last character as this would escape
      // the delimiter
      if (match[5].match(UNMATCHED_TRAILING_ESCAPE_SEQUENCES)) {
        end -= 1;
        break;
      }
      let nextCharacter =
        typeof context.next === "string" ? context.next[0] : "";
      if (
        end === text.length &&
        nextCharacter &&
        !nextCharacter.match(WHITESPACE_PUNCTUATION)
      ) {
        end -= match[5].length;
      } else {
        break;
      }
    }
  }

  if (options.escapeHtmlEntities) {
    return [text.slice(0, start), text.slice(start, end), text.slice(end)].map(
      escapeHtmlEntities
    ) as [string, string, string];
  } else {
    return [text.slice(0, start), text.slice(start, end), text.slice(end)].map(
      escapeEntities
    ) as [string, string, string];
  }
}

export function* split(): Generator<void, string[], string[]> {
  let rawText = yield;
  let text = rawText.join("");
  let start = 0;
  let end = text.length;
  let match;

  while (start < end) {
    match = text.slice(start).match(BEGINNING_WHITESPACE);
    if (!match) break;
    start += match[1].length;
  }
  while (end > start) {
    match = text.slice(0, end).match(ENDING_WHITESPACE);
    if (!match) break;
    end -= match[1].length;
  }

  return [text.slice(0, start), text.slice(start, end), text.slice(end)];
}

// http://spec.commonmark.org/0.28/#backslash-escapes
function escapePunctuation(
  text: string,
  options: { escapeHtmlEntities: boolean } = { escapeHtmlEntities: true }
) {
  let escaped = text
    .replace(/([#!*+=\\^_`{|}~])/g, "\\$1")
    .replace(/(\[)([^\]]*$)/g, "\\$1$2") // Escape bare opening brackets [
    .replace(/(^[\s]*)>/g, "$1\\>") // Escape >
    .replace(/(^[^[]*)(\].*$)/g, "$1\\$2") // Escape bare closing brackets ]
    .replace(/(\]\()/g, "]\\(") // Escape parenthesis ](
    .replace(/^(\s*\d+)\.(\s+)/gm, "$1\\.$2") // Escape list items with text following; not all numbers
    .replace(/^(\s*\d+)\.$/gm, "$1\\.") // Escape list items with no text following
    .replace(/(^[\s]*)-/g, "$1\\-") // `  - list item`
    .replace(/(\r\n|\r|\n)([\s]*)-/g, "$1$2\\-"); // `- list item\n - list item`

  if (options.escapeHtmlEntities) {
    return escapeHtmlEntities(escaped);
  } else {
    return escapeEntities(escaped);
  }
}

function escapeDescription(text: string) {
  let escaped = text
    .replace(/([#!*+=\\^_`{|}~])/g, "\\\\$1")
    .replace(/(\[)([^\]]*$)/g, "\\\\$1$2") // Escape bare opening brackets [
    .replace(/(^[\s]*)>/g, "$1\\\\>") // Escape >
    .replace(/(\]\()/g, "]\\\\(") // Escape parenthesis ](
    .replace(/(^[^[]*)(\].*$)/g, "$1\\\\$2") // Escape bare closing brackets ]
    .replace(/^(\s*\d+)\.(\s+)/gm, "$1\\\\.$2") // Escape list items; not all numbers
    .replace(/(^[\s]*)-/g, "$1\\\\-") // `  - list item`
    .replace(/(\r\n|\r|\n)([\s]*)-/g, "$1$2\\\\-"); // `- list item\n - list item`

  return escapeEntities(escaped);
}

function escapeHtmlEntities(text: string) {
  return text
    .replace(/&([^\s]+);/g, "\\&$1;")
    .replace(/</g, "&lt;")
    .replace(/\u00A0/gu, "&nbsp;")
    .replace(/\u2003/gu, "&emsp;");
}

function escapeEntities(text: string) {
  return text
    .replace(/&([^\s]+);/g, "\\&$1;")
    .replace(/\u00A0/gu, "&nbsp;")
    .replace(/\u2003/gu, "&emsp;");
}

function unescapeEntities(text: string) {
  return text
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&nbsp;/gi, "\u00A0")
    .replace(/&emsp;/gi, "\u2003");
}

function escapeAttribute(text: string) {
  return text.replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function getNumberOfRequiredBackticks(text: string) {
  let index = 0;
  let counts = [0];
  for (let i = 0, len = text.length; i < len; i++) {
    if (text[i] === "`") {
      counts[index] = counts[index] + 1;
    } else if (counts[index] !== 0) {
      counts.push(0);
      index++;
    }
  }

  let total = 1;
  for (let count of counts) {
    if (count === total) {
      total += 1;
    }
  }

  return total;
}

function blockquotify(line: string) {
  return `> ${line}`;
}

function codify(line: string) {
  return `    ${line}`;
}

export default class CommonmarkRenderer extends Renderer {
  protected state: any;

  constructor(
    document: Document | { text: string; marks: Mark[]; blocks: Block[] },
    /**
     * Controls whether HTML entities should be escaped. This
     * may be desireable if markdown is being generated for humans
     * and your markdown flavor doesn't support HTML.
     *
     * By default, `escapeHtmlEntities` is set to `true` if your
     * schema has an annotation with the type `html`. You can override
     * this configuration by passing in another parameter to the constructor.
     */
    protected options: {
      escapeHtmlEntities: boolean;
    } = { escapeHtmlEntities: true }
  ) {
    super(document);
    this.state = {};
  }

  text(text: string) {
    if (this.state.isPreformatted) {
      return text;
    }
    return escapePunctuation(text, this.options);
  }

  *root(): Iterator<void, string, string[]> {
    let rawText = yield;
    return rawText.join("");
  }

  /**
   * Bold text looks like **this** in Markdown.
   *
   * Asterisks are used here because they can split
   * words; underscores cannot split words.
   */
  *Bold(_: Mark, context: Context): Generator<void, string, string[]> {
    // Handle 4 / 5 star cases
    let state = { ...this.state };
    let needsUnderscoreBold = false;
    let suppressItalics = false;
    if (
      context.previous &&
      typeof context.previous !== "string" &&
      context.previous?.type === "bold"
    ) {
      needsUnderscoreBold = true;

      if (
        context.children.length === 1 &&
        typeof context.children[0] !== "string" &&
        context.children[0].type === "italic"
      ) {
        suppressItalics = true;
        this.state.suppressItalics = suppressItalics;
      }
    }

    let [before, text, after] = yield* splitDelimiterRuns(context, {
      ...this.options,
      ignoreInnerMark: suppressItalics,
    });
    this.state = state;

    if (text.length === 0) {
      return before + after;
    } else {
      // When there is no surrounding whitespace,
      // we will allow for an incorrect nesting of
      // bold / italic to maintain the general intent
      // over correctness.
      let hasInnerMarkup =
        context.children.length === 1 && before === "" && after === "";
      if (needsUnderscoreBold) {
        if (before.length === 0) {
          if (suppressItalics) {
            return `${before}*__${text}__*${after}`;
          } else {
            return `${before}__${text}__${after}`;
          }
        } else {
          if (suppressItalics) {
            return `${before}***${text}***${after}`;
          } else {
            return `${before}**${text}**${after}`;
          }
        }
      } else if (
        !context.previous &&
        !context.next &&
        context.parent?.type === "italic" &&
        !hasInnerMarkup
      ) {
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
  *Blockquote(): Generator<void, string, string[]> {
    if (this.state.inlineOnly) {
      return "";
    }
    let text = yield;
    let lines: string[] = text.join("").split("\n");
    let endOfQuote = lines.length;
    let startOfQuote = 0;

    while (startOfQuote < endOfQuote - 1 && lines[startOfQuote].match(/^\s*$/))
      startOfQuote++;
    while (
      endOfQuote > startOfQuote + 1 &&
      lines[endOfQuote - 1].match(/^\s*$/)
    )
      endOfQuote--;

    let quote =
      lines.slice(startOfQuote, endOfQuote).map(blockquotify).join("\n") + "\n";

    if (!this.state.tight) {
      quote += "\n";
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
  *Heading(heading: Heading): Generator<void, string, string[]> {
    if (this.state.inlineOnly) {
      return "";
    }
    let rawText = yield;
    let text = rawText.join("");
    let level = new Array(heading.attributes.level + 1).join("#");

    // Multiline headings are supported for level 1 and 2
    if (text.indexOf("\n") !== -1) {
      if (heading.attributes.level === 1) {
        return `${text}\n====\n`;
      } else if (heading.attributes.level === 2) {
        return `${text}\n----\n`;
      }
    }
    return `${level} ${text}\n`;
  }

  /**
   * A horizontal rule separates sections of a story
   * ***
   * Into multiple sections.
   */
  *HorizontalRule(): Generator<void, string, string[]> {
    if (this.state.inlineOnly) {
      return "";
    }
    return "***\n";
  }

  /**
   * Images are embedded like links, but with a `!` in front.
   * ![CommonMark](http://commonmark.org/images/markdown-mark.png)
   */
  *Image(image: Image): Generator<void, string, string[]> {
    let description = escapeDescription(image.attributes.description || "");
    let imageMarkdown = "";
    if (image.attributes.title) {
      let title = image.attributes.title.replace(/"/g, '\\"');
      imageMarkdown = `![${description}](${image.attributes.url} "${title}")`;
    } else {
      imageMarkdown = `![${description}](${image.attributes.url})`;
    }

    if (image.attributes.link?.url) {
      let { url, title } = image.attributes.link;
      url = url.replace(/\(/g, "\\(").replace(/\)/g, "\\)");
      let body = url;
      if (title) {
        title = title.replace(/"/g, '\\"');
        body = `${url} "${title}"`;
      }
      return `[${imageMarkdown}](${body})`;
    }
    return imageMarkdown;
  }

  /**
   * Italic text looks like *this* in Markdown.
   */
  *Italic(_: Mark, context: Context): Generator<void, string, string[]> {
    if (this.state.suppressItalics) {
      return (yield).join("");
    }
    // This adds support for strong emphasis (per Commonmark)
    // Strong emphasis includes _*two*_ emphasis markers around text.
    let state = Object.assign({}, this.state);
    this.state.isItalicized = true;

    let [before, text, after] = yield* splitDelimiterRuns(
      context,
      this.options
    );
    this.state = state;

    if (text.length === 0) {
      return before + after;
    } else {
      let markup = state.isItalicized ? "_" : "*";
      let hasWrappingBoldMarkup =
        !context.previous && !context.next && context.parent?.type === "bold";
      let hasAdjacentBoldMarkup =
        (typeof context.next !== "string" &&
          context.next?.type === "bold" &&
          after.length === 0) ||
        (typeof context.previous !== "string" &&
          context.previous?.type === "bold" &&
          before.length === 0);
      let hasAlignedParent =
        context.parent &&
        "range" in context.parent &&
        context.next == null &&
        context.previous == null;

      if (
        (hasWrappingBoldMarkup && !hasAlignedParent) ||
        hasAdjacentBoldMarkup
      ) {
        markup = "_";
      }
      return `${before}${markup}${text}${markup}${after}`;
    }
  }

  /**
   * A line break in Commonmark can be two white spaces at the end of the line  <--
   * or it can be a backslash at the end of the line\
   */
  *LineBreak(_: any, context: Context): Generator<void, string, string[]> {
    // Line breaks cannot end markdown block elements or paragraphs
    // https://spec.commonmark.org/0.29/#example-641
    if (
      context.parent &&
      "parents" in context.parent &&
      context.parent.parents &&
      context.next == null
    ) {
      return "";
    }

    // MD code and html blocks cannot contain line breaks
    // https://spec.commonmark.org/0.29/#example-637
    if (context.parent?.type === "code" || context.parent?.type === "html") {
      return "\n";
    }

    // two spaces + newline is parsed as a line break
    return "  \n";
  }

  /**
   * A [link](http://commonmark.org) has the url right next to it in Markdown.
   */
  *Link(link: Mark<Link>): Generator<void, string, string[]> {
    let [before, text, after] = yield* split();
    let url = escapeAttribute(link.attributes.url);
    if (link.attributes.title) {
      let title = link.attributes.title.replace(/"/g, '\\"');
      return `${before}[${text}](${url} "${title}")${after}`;
    }
    return `${before}[${text}](${url})${after}`;
  }

  /**
   * A `code` span is for an inline snippet
   */
  *Code(): Generator<void, string, string[]> {
    let state = Object.assign({}, this.state);
    Object.assign(this.state, {
      isPreformatted: true,
      htmlSafe: true,
    });

    let rawText = yield;
    let text = rawText.join("");
    this.state = state;

    // MarkdownIt strips all leading and trailing whitespace from code blocks,
    // which means that we get an empty string for a single whitespace (` `).
    if (text.length === 0) {
      return "` `";

      // We need to properly escape backticks inside of code blocks
      // by using variable numbers of backticks.
    } else {
      let backticks = "`".repeat(getNumberOfRequiredBackticks(text));
      return `${backticks}${text}${backticks}`;
    }
  }

  /**
   * A code block can be fenced or a block:
   *
   * ```js
   * function () {}
   * ```
   */
  *CodeBlock(
    code: Block<CodeBlock>,
    context: Context
  ): Generator<void, string, string[]> {
    if (this.state.inlineOnly) {
      return "";
    }
    let state = Object.assign({}, this.state);
    Object.assign(this.state, {
      isPreformatted: true,
      htmlSafe: true,
    });

    let rawText = yield;
    let text = rawText.join("");
    this.state = state;

    if (code.attributes.info != null) {
      text = "\n" + text;
      let info = code.attributes.info;
      let newlines = "\n";
      if (this.state.isList && context.next) {
        newlines += "\n";
      }

      if (text.indexOf("```") !== -1 || info.indexOf("```") !== -1) {
        return `~~~${info}${text}~~~${newlines}`;
      } else {
        return `\`\`\`${info}${text}\`\`\`${newlines}`;
      }
    } else {
      return text.split("\n").map(codify).join("\n") + "\n";
    }
  }

  *Html(html: Block<HTML>): Generator<void, string, string[]> {
    if (html.attributes.style === "block" && this.state.inlineOnly) {
      return "";
    }
    let state = Object.assign({}, this.state);
    Object.assign(this.state, {
      isPreformatted: true,
      htmlSafe: true,
    });

    let rawText = yield;
    let text = rawText.join("");

    this.state = state;

    if (html.attributes.style === "block") {
      return text + "\n";
    }
    return text;
  }

  /**
   * A list item is part of an ordered list or an unordered list.
   */
  *ListItem(): Generator<void, string, string[]> {
    if (this.state.inlineOnly) {
      return "";
    }
    let digit: number = this.state.digit;
    let delimiter = this.state.delimiter;
    let marker: string = delimiter;
    if (this.state.type === "numbered") {
      marker = `${digit}${delimiter}`;
      this.state.digit++;
    }

    let indent = " ".repeat(marker.length + 1);
    let text = yield;
    let item = text.join("");
    let firstCharacter = 0;
    while (item[firstCharacter] === " ") firstCharacter++;

    let lines: string[] = item.split("\n");
    lines.push((lines.pop() || "").replace(/[ ]+$/, ""));
    lines.unshift((lines.shift() || "").replace(/^[ ]+/, ""));
    let [first, ...rest] = lines;

    item =
      " ".repeat(firstCharacter) +
      first +
      "\n" +
      rest
        .map(function leftPad(line) {
          return indent + line + "\n";
        })
        .join("")
        .replace(/[ ]+$/, "");

    if (this.state.tight) {
      item = item.replace(/([ \n])+$/, "\n");
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
  *List(
    list: Block<List>,
    context: Context
  ): Generator<void, string, string[]> {
    if (this.state.inlineOnly) {
      return "";
    }
    let start = 1;

    if (list.attributes.startsAt != null) {
      start = list.attributes.startsAt;
    }

    let delimiter = "";

    if (list.attributes.type === "numbered") {
      delimiter = ".";

      if (
        typeof context.previous !== "string" &&
        context.previous?.type === "list" &&
        context.previous.attributes.type === "numbered" &&
        (context.previous.attributes.delimiter === "." ||
          context.previous.attributes.delimiter == null)
      ) {
        delimiter = ")";
      }
    } else if (list.attributes.type === "bulleted") {
      delimiter = "-";

      if (
        typeof context.previous !== "string" &&
        context.previous?.type === "list" &&
        context.previous.attributes.type === "bulleted" &&
        (context.previous.attributes.delimiter === "-" ||
          context.previous.attributes.delimiter == null)
      ) {
        delimiter = "+";
      }
    }

    let state = Object.assign({}, this.state);

    // Handle indendation for code blocks that immediately follow a list.
    let hasCodeBlockFollowing =
      typeof context.next !== "string" &&
      context.next?.type === "code-block" &&
      context.next.attributes.info == null;
    Object.assign(this.state, {
      isList: true,
      type: list.attributes.type,
      digit: start,
      delimiter,
      tight: !list.attributes.loose,
      hasCodeBlockFollowing,
    });

    let text = yield;

    this.state = state;
    return text.join("") + "\n";
  }

  /**
   * Paragraphs are delimited by two or more newlines in markdown.
   */
  *Paragraph(
    _paragraph: Block<Paragraph>,
    _context: Context
  ): Generator<void, string, string[]> {
    if (this.state.inlineOnly) {
      return "";
    }
    let rawText = yield;
    let text = rawText.join("");

    // If a paragraph has text, remove leading and trailing MD-meaningful
    // space characters which could be interpreted as indented code blocks
    // or line breaks
    if (!text.match(/^\s+$/g)) {
      text = text
        .replace(LEADING_MD_SPACES, "")
        .replace(TRAILING_MD_SPACES, "");
    }

    // Two newlines in raw text need to be encoded as HTML
    text = text.replace(/\n\n/g, "&#10;&#10;");

    if (this.state.tight) {
      return text + "\n";
    }
    return text + "\n\n";
  }

  *FixedIndent(): Generator<void, string, string[]> {
    let rawText = yield;
    return rawText.join("");
  }

  *DataSet(): Generator<void, string, string[]> {
    return (yield).join("");
  }

  *Table(
    table: Block<Table>,
    context: Context
  ): Generator<void, string, string[]> {
    if (this.state.inlineOnly) {
      return "";
    }

    const previousState = { ...this.state };
    this.state.inlineOnly = true;

    const dataSet = context.document.blocks.find((block) =>
      block.id.includes(table.attributes.dataSet)
    ) as Block<DataSet> | undefined;

    if (!dataSet) {
      /**
       * invalid dataset ref
       */

      throw new Error(
        `table ${table.id} references nonexistent dataset ${table.attributes.dataSet}`
      );
    }

    const columns: Record<
      string,
      {
        header: string;
        rows: string[];
        width: number;
        textAlignment?: TextAlignment;
      }
    > = {};

    for (let { columnName, slice: sliceId, textAlignment } of table.attributes
      .columns) {
      let headerText = "";
      if (table.attributes.showColumnHeaders) {
        if (sliceId) {
          const slice = this.getSlice(sliceId);
          if (!slice) {
            throw new Error(`column heading slice not found ${sliceId}`);
          }
          headerText = this.render(slice);
        }
      }
      columns[columnName] = {
        header: headerText.replace(/\n/g, " "),
        rows: [],
        width: Math.max(headerText.length, 1),
        textAlignment,
      };
    }

    for (let row of dataSet.attributes.records) {
      for (let { columnName } of table.attributes.columns) {
        let cellText = "";
        let sliceId = row[columnName]?.slice;

        if (sliceId) {
          let cellSlice = this.getSlice(sliceId);
          if (!cellSlice) {
            throw new Error(
              `Table ${table.id} ${table.range} with DataSet ${
                dataSet.attributes.name || dataSet.id
              }: document slice not found for column ${columnName} in row ${JSON.stringify(
                row,
                null,
                2
              )}`
            );
          }
          cellText = this.render(cellSlice);
        }

        columns[columnName].rows.push(cellText.replace(/\n/g, " "));
        columns[columnName].width = Math.max(
          columns[columnName].width,
          cellText.length
        );
      }
    }

    let headerRow = "|";
    let separatorRow = "|";

    for (let { columnName, textAlignment } of table.attributes.columns) {
      let headerText = columns[columnName].header;
      let columnWidth = columns[columnName].width;
      headerRow +=
        " " + headerText + " ".repeat(columnWidth - headerText.length) + " |";

      let leftDecoration =
        textAlignment === TextAlignment.Start ||
        textAlignment === TextAlignment.Center
          ? ":"
          : " ";
      let rightDecoration =
        textAlignment === TextAlignment.Center ||
        textAlignment === TextAlignment.End
          ? ":"
          : " ";
      separatorRow +=
        leftDecoration + "-".repeat(columnWidth) + rightDecoration + "|";
    }

    let body = "";

    dataSet.attributes.records.forEach((_row, index) => {
      body += "|";
      for (let { columnName } of table.attributes.columns) {
        let cellText = columns[columnName].rows[index];
        let columnWidth = columns[columnName].width;
        body +=
          " " + cellText + " ".repeat(columnWidth - cellText.length) + " |";
      }
      body += "\n";
    });

    this.state = previousState;
    return `${headerRow}\n${separatorRow}\n${body}\n`;
  }
}

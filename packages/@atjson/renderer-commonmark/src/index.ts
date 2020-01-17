import Document, { BlockAnnotation } from "@atjson/document";
import {
  // Code,
  HTML,
  Heading,
  Image,
  Italic,
  // Link,
  // List
} from "@atjson/offset-annotations";
import Renderer, { Context } from "@atjson/renderer-hir";
import {
  BEGINNING_WHITESPACE,
  // BEGINNING_WHITESPACE_PUNCTUATION,
  ENDING_WHITESPACE,
  // ENDING_WHITESPACE_PUNCTUATION,
  // LEADING_MD_SPACES,
  // TRAILING_MD_SPACES,
  // UNMATCHED_TRAILING_ESCAPE_SEQUENCES,
  // WHITESPACE_PUNCTUATION,
  // UNICODE_PUNCTUATION,
  MD_PUNCTUATION,
} from "./lib/punctuation";
import * as T from "./lib/tokens";
import { Stream } from "stream";
// import { stringify } from "querystring";
export * from "./lib/punctuation";

// function getEnd(a: { end: number }) {
//   return a.end;
// }

// export function* splitDelimiterRuns(
//   annotation: Annotation,
//   context: Context,
//   options: { escapeHtmlEntities: boolean } = { escapeHtmlEntities: true }
// ): Generator<void, [string, string, string], string[]> {
//   let rawText = yield;
//   let text = rawText.map(unescapeEntities).join("");
//   let start = 0;
//   let end = text.length;
//   let match;

//   let child = context.children.length === 1 ? context.children[0] : null;
//   if (
//     child &&
//     child.start === annotation.start &&
//     child.end === annotation.end &&
//     (child instanceof Bold || child instanceof Italic)
//   ) {
//     return ["", text, ""] as [string, string, string];
//   }

//   while (start < end) {
//     match = text.slice(start).match(BEGINNING_WHITESPACE_PUNCTUATION);
//     if (!match) break;
//     if (match[2]) {
//       start += match[2].length;
//     } else if (match[3]) {
//       let prevChar = getPreviousChar(context.document, annotation.start);
//       if (start === 0 && prevChar && !prevChar.match(WHITESPACE_PUNCTUATION)) {
//         start += match[3].length;
//       } else {
//         break;
//       }
//     }
//   }
//   while (end > start) {
//     match = text.slice(0, end).match(ENDING_WHITESPACE_PUNCTUATION);
//     if (!match) break;
//     if (match[4]) {
//       end -= match[4].length;
//     } else if (match[5]) {
//       // never include single backslash as last character as this would escape
//       // the delimiter
//       if (match[5].match(UNMATCHED_TRAILING_ESCAPE_SEQUENCES)) {
//         end -= 1;
//         break;
//       }
//       let nextChar = getNextChar(context.document, annotation.end);
//       if (
//         end === text.length &&
//         nextChar &&
//         !nextChar.match(WHITESPACE_PUNCTUATION)
//       ) {
//         end -= match[5].length;
//       } else {
//         break;
//       }
//     }
//   }

//   if (options.escapeHtmlEntities) {
//     return [text.slice(0, start), text.slice(start, end), text.slice(end)].map(
//       escapeHtmlEntities
//     ) as [string, string, string];
//   } else {
//     return [text.slice(0, start), text.slice(start, end), text.slice(end)].map(
//       escapeEntities
//     ) as [string, string, string];
//   }
// }

// export function* split(): Generator<void, string[], string[]> {
//   let rawText = yield;
//   let text = rawText.join("");
//   let start = 0;
//   let end = text.length;
//   let match;

//   while (start < end) {
//     match = text.slice(start).match(BEGINNING_WHITESPACE);
//     if (!match) break;
//     start += match[1].length;
//   }
//   while (end > start) {
//     match = text.slice(0, end).match(ENDING_WHITESPACE);
//     if (!match) break;
//     end -= match[1].length;
//   }

//   return [text.slice(0, start), text.slice(start, end), text.slice(end)];
// }

// http://spec.commonmark.org/0.28/#backslash-escapes
function escapePunctuation(
  text: string,
  options: { escapeHtmlEntities: boolean } = { escapeHtmlEntities: true }
) {
  let escaped = text
    .replace(/([#!*+=\\^_`{|}~])/g, "\\$1")
    .replace(/(\[)([^\]]*$)/g, "\\$1$2") // Escape bare opening brackets [
    .replace(/(^[^[]*)(\].*$)/g, "$1\\$2") // Escape bare closing brackets ]
    .replace(/(\]\()/g, "]\\(") // Escape parenthesis ](
    .replace(/^(\s*\d+)\.(\s+)/gm, "$1\\.$2") // Escape list items; not all numbers
    .replace(/(^[\s]*)-/g, "$1\\-") // `  - list item`
    .replace(/(\r\n|\r|\n)([\s]*)-/g, "$1$2\\-"); // `- list item\n - list item`

  if (options.escapeHtmlEntities) {
    return escapeHtmlEntities(escaped);
  } else {
    return escapeEntities(escaped);
  }
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

// function escapeAttribute(text: string) {
//   return text
//     .replace(/\(/g, "\\(")
//     .replace(/\)/g, "\\)");
// }

// function getNumberOfRequiredBackticks(text: string) {
//   let index = 0;
//   let counts = [0];
//   for (let i = 0, len = text.length; i < len; i++) {
//     if (text[i] === "`") {
//       counts[index] = counts[index] + 1;
//     } else if (counts[index] !== 0) {
//       counts.push(0);
//       index++;
//     }
//   }

//   let total = 1;
//   for (let count of counts) {
//     if (count === total) {
//       total += 1;
//     }
//   }

//   return total;
// }

function isHTML(a: { type: string }): a is HTML {
  return a.type === "html";
}

// function blockquotify(line: string) {
//   return `> ${line}`;
// }

// function codify(line: string) {
//   return `    ${line}`;
// }

type TokenStream = Array<T.Token | string>;

function flattenStreams(streams: Array<TokenStream>): TokenStream {
  let acc: TokenStream = [];

  return acc.concat(...streams);
}

function mapStrings(
  stream: TokenStream,
  transform: (s: string, i: number, collection: TokenStream) => string
): TokenStream {
  return stream.map(function applyTransformToStrings(s, i, collection) {
    if (typeof s === "string") {
      return transform(s, i, collection);
    }

    return s;
  });
}

function isMultiline(stream: TokenStream): boolean {
  for (let item of stream) {
    if (typeof item === "string") {
      if (item.indexOf("\n") >= 0) return true;
    } else if (item.kind === "LINE_BREAK") {
      return true;
    }
  }

  return false;
}

function lazilyTakePunctuationForward(str: string) {
  let startPuncMatcher = new RegExp(`^(${MD_PUNCTUATION.source})`);
  let match = str.match(startPuncMatcher);
  console.log({ str, startPuncMatcher, match });
  if (match) {
    let [punctuation] = match;
    return [punctuation, str.slice(1)];
  } else {
    return ["", str];
  }
}

function lazilyTakePunctuationBackward(str: string) {
  let endPuncMatcher = new RegExp(`(${MD_PUNCTUATION.source})$`);
  let match = str.match(endPuncMatcher);
  console.log({ str, endPuncMatcher, match });
  if (match) {
    let [punctuation] = match;
    return [str.slice(0, str.length - 1), punctuation];
  } else {
    return [str, ""];
  }
}

function greedilyTakeWhiteSpaceForward(str: string) {
  let startSpaceMatcher = /^(\s|&nbsp;)+/;
  let match = str.match(startSpaceMatcher);
  console.log({ startSpaceMatcher, match });
  if (match) {
    let [spaces] = match;
    return [spaces, str.slice(spaces.length)];
  } else {
    return ["", str];
  }
}

function greedilyTakeWhiteSpaceBackward(str: string) {
  let match = str.match(/(\s|&nbsp;)+$/);
  if (match) {
    let [spaces] = match;
    return [str.slice(0, str.length - spaces.length), spaces];
  } else {
    return [str, ""];
  }
}

/**

var vs = require('@atjson/offset-annotations/dist/commonjs').default;
var doc = new vs({ annotations: [{ type: '-offset-bold', start: 0, end: 5 }], content: 'hello world' });
var renderer = require('@atjson/renderer-commonmark/dist/commonjs').default;

renderer.render(doc)

*/

export default class CommonmarkRenderer extends Renderer {
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
  };

  protected state: any;

  constructor(document: Document, options?: { escapeHtmlEntities: boolean }) {
    super(document);
    this.state = {};
    if (options == null) {
      let DocumentClass = document.constructor as typeof Document;
      this.options = {
        escapeHtmlEntities: !!DocumentClass.schema.find(isHTML),
      };
    } else {
      this.options = options;
    }
  }

  text(text: string): TokenStream {
    if (this.state.isPreformatted) {
      return [text];
    }
    return [escapePunctuation(text, this.options)];
  }

  *root() {
    let stream: TokenStream = flattenStreams(yield).filter(
      (item) => item !== ""
    );

    console.log(stream);

    for (let i = 0; i < stream.length; i++) {
      let item = stream[i];

      if (typeof item === "string") {
        continue;
      }

      switch (item.kind) {
        case "STRONG_STAR_START":
        case "STRONG_UNDERSCORE_START":
        case "EM_STAR_START":
        case "EM_UNDERSCORE_START": {
          let next = stream[i + 1];
          let prefix = "";
          if (typeof next === "string") {
            let [punctuation, firstNext] = lazilyTakePunctuationForward(next);
            let [whitespace, newNext] = greedilyTakeWhiteSpaceForward(
              firstNext
            );

            stream[i + 1] = newNext;
            prefix = punctuation + whitespace;
          }

          stream[i] = T.TOKENIZE(prefix + item.production);
          break;
        }
        case "STRONG_STAR_END":
        case "STRONG_UNDERSCORE_END":
        case "EM_STAR_END":
        case "EM_UNDERSCORE_END": {
          let previous = stream[i - 1];
          let suffix = "";
          if (typeof previous === "string") {
            let [firstPrevious, punctuation] = lazilyTakePunctuationBackward(
              previous
            );
            let [newPrevious, whitespace] = greedilyTakeWhiteSpaceBackward(
              firstPrevious
            );

            stream[i - 1] = newPrevious;
            suffix = whitespace + punctuation;
          }

          stream[i] = T.TOKENIZE(item.production + suffix);
          break;
        }
        case "ANCHOR_TEXT_START": {
          let next = stream[i + 1];
          let prefix = "";
          if (typeof next === "string") {
            let [whitespace, newNext] = greedilyTakeWhiteSpaceForward(next);

            stream[i + 1] = newNext;
            prefix = whitespace;
          }

          stream[i] = T.TOKENIZE(prefix + item.production);
          break;
        }
      }
    }

    return stream
      .map((item) => {
        if (typeof item === "string") {
          return item;
        } else {
          return item.production;
        }
      })
      .join("");
  }

  /**
   * Bold text looks like **this** in Markdown.
   *
   * Asterisks are used here because they can split
   * words; underscores cannot split words.
   */
  *Bold(): Iterator<void, TokenStream, TokenStream[]> {
    let inner = flattenStreams(yield);
    console.log(inner);
    if (inner.length === 0) {
      return [];
    } else {
      return [T.STRONG_STAR_START(), ...inner, T.STRONG_STAR_END()];
    }
  }

  // /**
  //  * > A block quote has `>` in front of every line
  //  * > it is on.
  //  * >
  //  * > It can also span multiple lines.
  //  */
  // *Blockquote(): Iterator<void, string, string[]> {
  //   let text = yield;
  //   let lines: string[] = text.join("").split("\n");
  //   let endOfQuote = lines.length;
  //   let startOfQuote = 0;

  //   while (startOfQuote < endOfQuote - 1 && lines[startOfQuote].match(/^\s*$/))
  //     startOfQuote++;
  //   while (
  //     endOfQuote > startOfQuote + 1 &&
  //     lines[endOfQuote - 1].match(/^\s*$/)
  //   )
  //     endOfQuote--;

  //   let quote =
  //     lines
  //       .slice(startOfQuote, endOfQuote)
  //       .map(blockquotify)
  //       .join("\n") + "\n";

  //   if (!this.state.tight) {
  //     quote += "\n";
  //   }
  //   return quote;
  // }

  /**
   * # Headings have 6 levels, with a single `#` being the most important
   *
   * ###### and six `#` being the least important
   *
   * If the heading spans multiple lines, then we will use the underline
   * style, using a series of `=` or `-` markers. This only works for
   * headings of level 1 or 2, so any other level will be broken.
   */
  *Heading(heading: Heading): Iterator<void, TokenStream, TokenStream[]> {
    let inner = flattenStreams(yield);

    // Multiline headings are supported for level 1 and 2
    if (isMultiline(inner)) {
      if (heading.attributes.level === 1) {
        return [
          T.LINE_BREAK(),
          ...inner,
          T.LINE_BREAK(),
          T.SETEXT_HEADING_1(),
          T.LINE_BREAK(),
        ];
      } else if (heading.attributes.level === 2) {
        return [
          T.LINE_BREAK(),
          ...inner,
          T.LINE_BREAK(),
          T.SETEXT_HEADING_2(),
          T.LINE_BREAK(),
        ];
      }
    }

    let headingLevels = [
      undefined,
      T.ATX_HEADING_1(),
      T.ATX_HEADING_2(),
      T.ATX_HEADING_3(),
      T.ATX_HEADING_4(),
      T.ATX_HEADING_5(),
      T.ATX_HEADING_6(),
    ];

    let headingMarker =
      headingLevels[heading.attributes.level] || T.ATX_HEADING_6();
    return [headingMarker, ...inner, T.LINE_BREAK()];
  }

  /**
   * A horizontal rule separates sections of a story
   * ***
   * Into multiple sections.
   */
  *HorizontalRule(): Iterator<void, TokenStream, TokenStream[]> {
    return [T.THEMATIC_BREAK(), T.LINE_BREAK()];
  }

  /**
   * Images are embedded like links, but with a `!` in front.
   * ![CommonMark](http://commonmark.org/images/markdown-mark.png)
   */
  *Image(image: Image): Iterator<void, TokenStream, TokenStream[]> {
    let description = image.attributes.description || "";
    let url = image.attributes.url;
    if (image.attributes.title) {
      let title = image.attributes.title.replace(/"/g, '\\"');
      url += ` "${title}"`;
    }
    return [
      T.IMAGE_ALT_TEXT_START(),
      description,
      T.IMAGE_ALT_TEXT_END_URL(url),
    ];
  }

  /**
   * Italic text looks like *this* in Markdown.
   */
  *Italic(
    italic: Italic,
    context: Context
  ): Iterator<void, TokenStream, TokenStream[]> {
    let inner = flattenStreams(yield);
    if (inner.length === 0) {
      return [];
    } else {
      if (
        context.parent instanceof Italic &&
        context.parent.start === italic.start &&
        context.parent.end === italic.end
      ) {
        return [T.EM_UNDERSCORE_START(), ...inner, T.EM_UNDERSCORE_END()];
      } else {
        return [T.EM_STAR_START(), ...inner, T.EM_STAR_END()];
      }
    }
  }

  /**
   * A line break in Commonmark can be two white spaces at the end of the line  <--
   * or it can be a backslash at the end of the line\
   */
  *LineBreak(
    _: any,
    context: Context
  ): Iterator<void, TokenStream, TokenStream[]> {
    // Line breaks cannot end markdown block elements or paragraphs
    // https://spec.commonmark.org/0.29/#example-641
    if (context.parent instanceof BlockAnnotation && context.next == null) {
      return [];
    }

    // MD code and html blocks cannot contain line breaks
    // https://spec.commonmark.org/0.29/#example-637
    if (context.parent.type === "code" || context.parent.type === "html") {
      return [T.LINE_BREAK()];
    }

    return [T.SOFT_LINE_BREAK()];
  }

  /**
   * A [link](http://commonmark.org) has the url right next to it in Markdown.
   */
  *Link(link: Link): Iterator<void, TokenStream, TokenStream[]> {
    let inner = flattenStreams(yield);
    let url = link.attributes.url;
    if (link.attributes.title) {
      let title = link.attributes.title.replace(/"/g, '\\"');
      url += ` "${title}"`;
    }

    return [T.ANCHOR_TEXT_START(), ...inner, T.ANCHOR_TEXT_END_HREF(url)];
  }

  // /**
  //  * A `code` span can be inline or as a block:
  //  *
  //  * ```js
  //  * function () {}
  //  * ```
  //  */
  // *Code(code: Code, context: Context): Iterator<void, string, string[]> {
  //   let state = Object.assign({}, this.state);
  //   Object.assign(this.state, {
  //     isPreformatted: true,
  //     htmlSafe: true
  //   });

  //   let rawText = yield;
  //   let text = rawText.join("");
  //   this.state = state;

  //   if (code.attributes.style === "fence") {
  //     text = "\n" + text;
  //     let info = code.attributes.info || "";
  //     let newlines = "\n";
  //     if (this.state.isList && context.next) {
  //       newlines += "\n";
  //     }

  //     if (text.indexOf("```") !== -1 || info.indexOf("```") !== -1) {
  //       return `~~~${info}${text}~~~${newlines}`;
  //     } else {
  //       return `\`\`\`${info}${text}\`\`\`${newlines}`;
  //     }
  //   } else if (code.attributes.style === "block") {
  //     return (
  //       text
  //         .split("\n")
  //         .map(codify)
  //         .join("\n") + "\n"
  //     );
  //   } else {
  //     // MarkdownIt strips all leading and trailing whitespace from code blocks,
  //     // which means that we get an empty string for a single whitespace (` `).
  //     if (text.length === 0) {
  //       return "` `";

  //       // We need to properly escape backticks inside of code blocks
  //       // by using variable numbers of backticks.
  //     } else {
  //       let backticks = "`".repeat(getNumberOfRequiredBackticks(text));
  //       return `${backticks}${text}${backticks}`;
  //     }
  //   }
  // }

  *Html(html: HTML): Iterator<void, TokenStream, TokenStream[]> {
    let initialState = Object.assign({}, this.state);
    Object.assign(this.state, {
      isPreformatted: true,
      htmlSafe: true,
    });

    let inner = flattenStreams(yield);

    this.state = initialState;

    if (html.attributes.style === "block") {
      return [...inner, T.LINE_BREAK()]; // text + "\n";
    }
    return inner;
  }

  // /**
  //  * A list item is part of an ordered list or an unordered list.
  //  */
  // *ListItem(): Iterator<void, string, string[]> {
  //   let digit: number = this.state.digit;
  //   let delimiter = this.state.delimiter;
  //   let marker: string = delimiter;
  //   if (this.state.type === "numbered") {
  //     marker = `${digit}${delimiter}`;
  //     this.state.digit++;
  //   }

  //   let indent = " ".repeat(marker.length + 1);
  //   let text = yield;
  //   let item = text.join("");
  //   let firstCharacter = 0;
  //   while (item[firstCharacter] === " ") firstCharacter++;

  //   let lines: string[] = item.split("\n");
  //   lines.push((lines.pop() || "").replace(/[ ]+$/, ""));
  //   lines.unshift((lines.shift() || "").replace(/^[ ]+/, ""));
  //   let [first, ...rest] = lines;

  //   item =
  //     " ".repeat(firstCharacter) +
  //     first +
  //     "\n" +
  //     rest
  //       .map(function leftPad(line) {
  //         return indent + line;
  //       })
  //       .join("\n")
  //       .replace(/[ ]+$/, "");

  //   if (this.state.tight) {
  //     item = item.replace(/([ \n])+$/, "\n");
  //   }

  //   // Code blocks using spaces can follow lists,
  //   // however, they will be included in the list
  //   // if we don't adjust spacing on the list item
  //   // to force the code block outside of the list
  //   // See http://spec.commonmark.org/dingus/?text=%20-%20%20%20hello%0A%0A%20%20%20%20I%27m%20a%20code%20block%20_outside_%20the%20list%0A
  //   if (this.state.hasCodeBlockFollowing) {
  //     return ` ${marker}    ${item}`;
  //   }
  //   return `${marker} ${item}`;
  // }

  // /**
  //  * 1. An ordered list contains
  //  * 2. A number
  //  * 3. Of things with numbers preceding them
  //  */
  // *List(list: List, context: Context): Iterator<void, string, string[]> {
  //   let start = 1;

  //   if (list.attributes.startsAt != null) {
  //     start = list.attributes.startsAt;
  //   }

  //   let delimiter = "";

  //   if (list.attributes.type === "numbered") {
  //     delimiter = ".";

  //     if (
  //       context.previous instanceof List &&
  //       context.previous.attributes.type === "numbered" &&
  //       context.previous.attributes.delimiter === "."
  //     ) {
  //       delimiter = ")";
  //     }
  //   } else if (list.attributes.type === "bulleted") {
  //     delimiter = "-";

  //     if (
  //       context.previous instanceof List &&
  //       context.previous.attributes.type === "bulleted" &&
  //       context.previous.attributes.delimiter === "-"
  //     ) {
  //       delimiter = "+";
  //     }
  //   }
  //   list.attributes.delimiter = delimiter;

  //   let state = Object.assign({}, this.state);

  //   // Handle indendation for code blocks that immediately follow a list.
  //   let hasCodeBlockFollowing =
  //     context.next instanceof Code && context.next.attributes.style === "block";
  //   Object.assign(this.state, {
  //     isList: true,
  //     type: list.attributes.type,
  //     digit: start,
  //     delimiter,
  //     tight: list.attributes.tight,
  //     hasCodeBlockFollowing
  //   });

  //   let text = yield;

  //   this.state = state;
  //   return text.join("") + "\n";
  // }

  /**
   * Paragraphs are delimited by two or more newlines in markdown.
   */
  *Paragraph(): Iterator<void, TokenStream, TokenStream[]> {
    let inner = flattenStreams(yield);

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

  *FixedIndent(): Iterator<void, TokenStream, TokenStream[]> {
    return flattenStreams(yield);
  }
}

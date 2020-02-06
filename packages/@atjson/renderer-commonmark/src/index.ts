import Document, { BlockAnnotation /*Annotation*/ } from "@atjson/document";
import {
  Code,
  HTML,
  Heading,
  Image,
  Italic,
  Link,
  List,
} from "@atjson/offset-annotations";
import Renderer, { Context } from "@atjson/renderer-hir";
import {
  // BEGINNING_WHITESPACE,
  // BEGINNING_WHITESPACE_PUNCTUATION,
  // ENDING_WHITESPACE,
  // ENDING_WHITESPACE_PUNCTUATION,
  // LEADING_MD_SPACES,
  // TRAILING_MD_SPACES,
  // UNMATCHED_TRAILING_ESCAPE_SEQUENCES,
  // WHITESPACE_PUNCTUATION,
  // UNICODE_PUNCTUATION,
  MD_PUNCTUATION,
  LEADING_MD_SPACES,
  TRAILING_MD_SPACES,
  MD_SPACES,
} from "./lib/punctuation";
import * as T from "./lib/tokens";
export * from "./lib/punctuation";
import { removeEmptyInlineTokens } from "./lib/remove-empty-inline-tokens";
import { addDelimitersToLists } from "./lib/add-delimiters-to-lists";

export function flatMapStringReplace(
  string: string,
  re: RegExp,
  replacer: (a: RegExpMatchArray) => TokenStream
): TokenStream {
  let flags = re.flags.replace("g", "");
  re = new RegExp(re, flags);

  let acc: TokenStream = [];

  let match: RegExpMatchArray | null;
  while (string.length && (match = string.match(re)) && match.index != null) {
    let stringTilMatch = string.slice(0, match.index);
    string = string.slice(match.index + match[0].length);

    let subStream = replacer(match);

    if (stringTilMatch.length) {
      acc.push(stringTilMatch);
    }

    if (subStream.length) {
      acc.push(...subStream);
    }
  }

  if (string.length) {
    acc.push(string);
  }

  return acc;
}

export function streamFlatMapStringReplace(
  stream: TokenStream,
  re: RegExp,
  replacer: (a: RegExpMatchArray) => TokenStream
) {
  return flatMap(stream, (item) => {
    if (typeof item === "string") {
      return flatMapStringReplace(item, re, replacer);
    } else {
      return [item];
    }
  });
}

// http://spec.commonmark.org/0.28/#backslash-escapes
function escapePunctuation(
  raw: TokenStream,
  options: { escapeHtmlEntities: boolean } = { escapeHtmlEntities: true }
): TokenStream {
  //   -- .replace(/([#!*+=\\^_`{|}~])/g, "\\$1")
  let escaped = streamFlatMapStringReplace(
    raw,
    /([#!*+=\\^_`{|}~])/,
    ([, $1]) => [T.EscapedPunctuation($1)]
  );

  //   -- .replace(/(\[)([^\]]*$)/g, "\\$1$2") // Escape bare opening brackets [
  escaped = streamFlatMapStringReplace(
    escaped,
    /(\[)([^\]]*$)/,
    ([, $1, $2]) => [T.EscapedPunctuation($1), $2]
  );

  //   -- .replace(/(^[^[]*)(\].*$)/g, "$1\\$2") // Escape bare closing brackets ]
  escaped = streamFlatMapStringReplace(
    escaped,
    /(^[^[]*)(\].*$)/,
    ([, $1, $2]) => [$1, T.EscapedPunctuation($2)]
  );

  //   .replace(/(\]\()/g, "]\\(") // Escape parenthesis ](
  escaped = streamFlatMapStringReplace(escaped, /(\]\()/, () => [
    "]",
    T.EscapedPunctuation("("),
  ]);

  //   .replace(/^(\s*\d+)\.(\s+)/gm, "$1\\.$2") // Escape list items; not all numbers
  escaped = streamFlatMapStringReplace(
    escaped,
    /^(\s*\d+)\.(\s+)/,
    ([, $1, $2]) => [$1, T.EscapedPunctuation("."), $2]
  );

  //   .replace(/(^[\s]*)-/g, "$1\\-") // `  - list item`
  escaped = streamFlatMapStringReplace(escaped, /(^[\s]*)-/g, ([, $1]) => [
    $1,
    T.EscapedPunctuation("-"),
  ]);

  //   .replace(/(\r\n|\r|\n)([\s]*)-/g, "$1$2\\-"); // `- list item\n - list item`
  escaped = streamFlatMapStringReplace(
    escaped,
    /(\r\n|\r|\n)([\s]*)-/,
    ([, $1, $2]) => [$1, $2, T.EscapedPunctuation("-")]
  );

  escaped = escapeEntities(escaped);

  if (options.escapeHtmlEntities) {
    return escapeHtmlEntities(escaped);
  }

  return escaped;
}

function escapeHtmlEntities(raw: TokenStream) {
  //   .replace(/</g, "&lt;")
  return streamFlatMapStringReplace(raw, /</, () => [T.HTMLEntity("lt")]);
}

function escapeEntities(raw: TokenStream) {
  //   .replace(/&([^\s]+);/g, "\\&$1;")
  let escaped = streamFlatMapStringReplace(raw, /&([^\s]+);/, ([, $1]) => [
    T.EscapedPunctuation("&"),
    $1,
    ";",
  ]);

  //   .replace(/\u00A0/gu, "&nbsp;")
  escaped = streamFlatMapStringReplace(escaped, /\u00A0/, () => [
    T.NoBreakSpace,
  ]);

  //   .replace(/\u2003/gu, "&emsp;");
  escaped = streamFlatMapStringReplace(escaped, /\u2003/, () => [T.EmSpace]);

  return escaped;
}

// function escapeAttribute(text: string) {
//   return text
//     .replace(/\(/g, "\\(")
//     .replace(/\)/g, "\\)");
// }

function array<T>(x: T): T[] {
  return [x];
}

function isHTML(a: { type: string }): a is HTML {
  return a.type === "html";
}

export type TokenStream = Array<T.Token | string>;

function isLeftDelimiter(
  item: T.Token | string
): item is
  | typeof T.StrongStarStart
  | typeof T.StrongUnderscoreStart
  | typeof T.EmphasisStarStart
  | typeof T.EmphasisUnderscoreStart {
  let tokens = [
    "STRONG_STAR_START",
    "STRONG_UNDERSCORE_START",
    "EM_STAR_START",
    "EM_UNDERSCORE_START",
  ];
  return typeof item !== "string" && tokens.includes(item.kind);
}

function isRightDelimiter(
  item: T.Token | string
): item is
  | typeof T.StrongStarEnd
  | typeof T.StrongUnderscoreEnd
  | typeof T.EmphasisStarEnd
  | typeof T.EmphasisUnderscoreEnd {
  let tokens = [
    "STRONG_STAR_END",
    "STRONG_UNDERSCORE_END",
    "EM_STAR_END",
    "EM_UNDERSCORE_END",
  ];

  return typeof item !== "string" && tokens.includes(item.kind);
}

export function fixDelimiterRuns(stream: TokenStream): TokenStream {
  // copies and cleans the stream in one step :)
  stream = stream.filter(function notEmptyString(x) {
    return x !== "";
  });

  for (let i = 0; i < stream.length; i++) {
    let prevItem = stream[i - 1];
    let nextItem = stream[i + 1];
    let currItem = stream[i];

    if (typeof currItem === "string") {
      continue;
    }

    switch (currItem.kind) {
      case "STRONG_STAR_START":
      case "STRONG_UNDERSCORE_START":
      case "EM_STAR_START":
      case "EM_UNDERSCORE_START": {
        /**
         * we're gonna look forward in the stream for any invalid inner boundary characters and move them leftwards until they aren't invalid anymore
         */
        let itemsToMoveOut: TokenStream = [];

        /**
         * seek backwards until we find a valid place to put the invalid characters
         */
        let j = i;
        while (j >= 0) {
          if (isLeftDelimiter(stream[j])) {
            j--;
          } else {
            break;
          }
        }

        let leftBoundaryItem = stream[j];

        /**
         * if the left side is whitespace or punctuation we don't
         *  need to worry about punctuation on the right side
         */
        if (
          leftBoundaryItem &&
          !hasTrailingWhitespace(leftBoundaryItem) &&
          !hasTrailingPunctuation(leftBoundaryItem)
        ) {
          /**
           * take off any inner-boundary punctuation and get ready to move it out
           */
          if (typeof nextItem === "string") {
            let [
              punctuation,
              nextItemWithoutLeadingPunctuation,
            ] = lazilyTakePunctuationForward(nextItem);

            itemsToMoveOut.push(punctuation);
            stream[i + 1] = nextItemWithoutLeadingPunctuation;
          } // TODO: non-syntax punctuation token???
        }

        /**
         * consume items from the stream ahead of us until we find a
         *  non-whitespace token or string. If it was a string, it may have been
         *  split into its leading whitespace and the trailing portion
         */

        let {
          leadingSpaces,
          splitLeadingString,
        } = greedilyTakeLeadingWhiteSpace(stream, i + 1);

        itemsToMoveOut.push(...leadingSpaces);

        itemsToMoveOut = itemsToMoveOut.filter((item) => item !== "");

        /**
         * at this point `j` is the index at/before which we need to put the
         *  invalid inner boundary characters.
         * (if we ran off the edge of the string `j` is -1, which is fine)
         *
         * at position `j + 1` we remove 0 characters and insert the `itemsToMoveOut`
         */
        stream.splice(j + 1, 0, ...itemsToMoveOut);

        /**
         * we've inserted items into the stream before the current position,
         *  so we need to update the current index accordingly
         */
        i += itemsToMoveOut.length;

        /**
         * replace the remainder of the stream with whatever else we
         *  got from taking the leading whitespace
         */
        stream.splice(i + 1, leadingSpaces.length);

        if (splitLeadingString) {
          stream.splice(i + 1, 0, splitLeadingString);
        }
        break;
      }
      case "STRONG_STAR_END":
      case "STRONG_UNDERSCORE_END":
      case "EM_STAR_END":
      case "EM_UNDERSCORE_END": {
        /**
         * we're gonna look *backward* this time, but the approach is
         *  otherwise similar to before
         */
        let itemsToMoveOut: TokenStream = [];

        /**
         * seek forwards in the stream until we find a valid place to put
         *  the invalid characters
         */
        let j = i;
        while (j < stream.length) {
          if (isRightDelimiter(stream[j])) {
            j++;
          } else {
            break;
          }
        }

        let rightBoundaryItem = stream[j];

        /**
         * we only need to worry about punctuation if there's a non-whitespace,
         *  non-punctuation character ahead
         */
        if (
          rightBoundaryItem &&
          !hasLeadingWhitespace(rightBoundaryItem) &&
          !hasLeadingPunctuation(rightBoundaryItem)
        ) {
          /**
           * take off any inner-boundary punctuation and get ready to move it out
           */
          if (typeof prevItem === "string") {
            let [
              punctuation,
              prevItemWithoutTrailingPunctuation,
            ] = lazilyTakePunctuationBackward(prevItem);

            itemsToMoveOut.unshift(punctuation);
            stream[i - 1] = prevItemWithoutTrailingPunctuation;
          } // TODO: is the previous item a token representing non-syntax punctuation?
        }

        /**
         * this is gonna end with us replacing the stream to the left of us with
         *  the `leadingStream` value below. This is fine, since we already know
         *  any delimiter runs earlier in the stream are fixed and
         *  this operation won't break them (I'm like 99% sure - Colin-Alexa)
         */

        let {
          trailingSpaces,
          splitTrailingString,
        } = greedilyTakeTrailingWhiteSpace(stream, i - 1);

        itemsToMoveOut = trailingSpaces.concat(itemsToMoveOut);

        itemsToMoveOut = itemsToMoveOut.filter((item) => item !== "");
        /**
         * at this point `j` is the index at/after which we need to put the
         *  invalid inner boundary characters.
         *
         * at position `j` we remove 0 characters and insert the `itemsToMoveOut`
         */
        stream.splice(j, 0, ...itemsToMoveOut);

        stream.splice(i - trailingSpaces.length, trailingSpaces.length);

        if (splitTrailingString) {
          stream.splice(i - 1, 0, splitTrailingString);
        }

        i -= trailingSpaces.length;
        break;
      }
      case "ANCHOR_TEXT_START": {
        let {
          leadingSpaces,
          splitLeadingString,
        } = greedilyTakeLeadingWhiteSpace(stream, i + 1);

        /**
         *  - put the spaces into the stream behind us
         *  - adjust the current index for the added length
         *  - remove the spaces we found from the stream ahead of us
         *  - if we split a string while taking the leading spaces, add
         *     back the remainder of the string
         */
        stream.splice(i, 0, ...leadingSpaces);
        i += leadingSpaces.length;
        stream.splice(i + 1, leadingSpaces.length);
        if (splitLeadingString) {
          stream.splice(i + leadingSpaces.length, 0, splitLeadingString);
        }
        break;
      }
      case "ANCHOR_TEXT_END_HREF": {
        let {
          trailingSpaces,
          splitTrailingString,
        } = greedilyTakeTrailingWhiteSpace(stream, i - 1);

        /**
         * - put the spaces into the stream ahead of us
         * - remove the spaces from the stream behind us
         * - if we split a string, add the remainder of the string back
         *    into the stream behind us
         */

        stream.splice(i + 1, 0, ...trailingSpaces);
        stream.splice(i - trailingSpaces.length, trailingSpaces.length);

        if (splitTrailingString) {
          stream.splice(i - 1, 0, splitTrailingString);
        }
        break;
      }
    }
  }

  return stream;
}

function toString(stream: TokenStream): string {
  return stream
    .map(function tokenOrStringToString(item) {
      if (typeof item === "string") {
        return item;
      } else {
        return item.value;
      }
    })
    .join("");
}

export function flattenStreams(
  itemsOrStreams: Array<TokenStream | T.Token | string>
): TokenStream {
  let acc: TokenStream = [];
  for (let itemOrStream of itemsOrStreams) {
    if (Array.isArray(itemOrStream)) {
      acc = acc.concat(itemOrStream);
    } else {
      acc.push(itemOrStream);
    }
  }

  return mergeStrings(acc);
}

function flatMap(
  stream: TokenStream,
  mapper: (item: T.Token | string, i: number, s: TokenStream) => TokenStream
) {
  let acc: TokenStream = [];
  return acc.concat(...stream.map(mapper));
}

function intersperse<T>(arr: T[], spacer: T): T[] {
  if (arr.length === 0) {
    return [];
  }

  let [firstItem, ...rest] = arr;
  let acc: T[] = [firstItem];
  for (let item of rest) {
    acc.push(spacer, item);
  }

  return acc;
}

export function mergeStrings(stream: TokenStream): TokenStream {
  let acc: TokenStream = [];
  let stringAcc;
  for (let item of stream) {
    if (typeof item === "string") {
      stringAcc = (stringAcc || "") + item;
    } else {
      if (stringAcc) {
        acc.push(stringAcc);
      }

      stringAcc = undefined;
      acc.push(item);
    }
  }

  if (stringAcc) {
    acc.push(stringAcc);
  }

  return acc;
}

export function splitLines(stream: TokenStream): TokenStream[] {
  let lines: TokenStream[] = [];
  let line: TokenStream = [];

  for (let item of stream) {
    if (typeof item === "string" && item.includes("\n")) {
      let parts = item.split("\n");
      if (parts.length) {
        // always true
        let [firstLine, ...middleLines] = parts.slice(0, parts.length - 1);
        line.push(firstLine);
        lines.push(line, ...middleLines.map((line) => [...line]));
        line = array(parts[parts.length - 1]);
      }
    } else {
      line.push(item);
    }
  }

  lines.push(line);

  return lines;
}

export function streamIncludes(
  stream: TokenStream,
  needle: string | T.Token
): boolean {
  for (let item of stream) {
    let stringIncludesNeedle =
      typeof item === "string" &&
      typeof needle === "string" &&
      item.includes(needle);
    let tokenEqualsNeedle =
      typeof item !== "string" &&
      typeof needle !== "string" &&
      item.kind === needle.kind &&
      item.value === needle.value;

    if (stringIncludesNeedle || tokenEqualsNeedle) {
      return true;
    }
  }

  return false;
}

function lazilyTakePunctuationForward(str: string): [string, string] {
  let startPuncMatcher = new RegExp(`^(${MD_PUNCTUATION.source})`);
  let match = str.match(startPuncMatcher);

  if (match) {
    let [punctuation] = match;
    return [punctuation, str.slice(1)];
  } else {
    return ["", str];
  }
}

function lazilyTakePunctuationBackward(str: string): [string, string] {
  let endPuncMatcher = new RegExp(`(${MD_PUNCTUATION.source})$`);
  let match = str.match(endPuncMatcher);

  if (match) {
    let [punctuation] = match;
    return [punctuation, str.slice(0, str.length - 1)];
  } else {
    return ["", str];
  }
}

function containsNonSpaces(str: string) {
  let onlySpacesMatcher = new RegExp(`^${MD_SPACES.source}$`, "g");
  return !onlySpacesMatcher.test(str);
}

function isWhitespace(item: T.Token | string) {
  if (typeof item === "string") {
    return !containsNonSpaces(item);
  } else {
    return item === T.HardLineBreak || item === T.BlockSeparator;
  }
}

export function hasTrailingWhitespace(item: T.Token | string): boolean {
  let trailingSpacesRe = new RegExp(TRAILING_MD_SPACES);
  if (typeof item === "string") {
    return trailingSpacesRe.test(item);
  } else {
    return isWhitespace(item);
  }
}

export function hasLeadingWhitespace(item: T.Token | string): boolean {
  let leadingSpacesRe = new RegExp(LEADING_MD_SPACES);
  if (typeof item === "string") {
    return leadingSpacesRe.test(item);
  } else {
    return isWhitespace(item);
  }
}

export function hasTrailingPunctuation(
  item: T.Token | string
): item is string | ReturnType<typeof T.EscapedPunctuation> {
  let trailingPunctuationRe = new RegExp(`(${MD_PUNCTUATION.source})+$`);
  if (typeof item === "string") {
    return trailingPunctuationRe.test(item);
  } else {
    // if it's a token it's either whitespace or punctuation
    return item.kind === "ESCAPED_PUNCTUATION";
  }
}

export function hasLeadingPunctuation(
  item: T.Token | string
): item is string | ReturnType<typeof T.EscapedPunctuation> {
  let leadingPunctuationRe = new RegExp(`^(${MD_PUNCTUATION.source})+`);
  if (typeof item === "string") {
    return leadingPunctuationRe.test(item);
  } else {
    return item.kind === "ESCAPED_PUNCTUATION";
  }
}

export function greedilyTakeLeadingWhiteSpace(
  stream: TokenStream,
  startIndex: number
): {
  leadingSpaces: TokenStream;
  trailingStream: TokenStream;
  splitLeadingString: string | undefined;
} {
  let acc = [];
  let leftover: string | undefined;
  for (let i = startIndex; i >= 0 && i < stream.length; i++) {
    let item = stream[i];
    // take whitespace items from the beginning of the stream until we hit something
    if (isWhitespace(item)) {
      acc.push(item);
    } else if (typeof item === "string") {
      let match = item.match(new RegExp(LEADING_MD_SPACES, ""));
      if (match) {
        let [spaces] = match;
        acc.push(spaces);
        leftover = item.slice(spaces.length);
        break;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return {
    leadingSpaces: acc,
    trailingStream: stream.slice(startIndex + acc.length),
    splitLeadingString: leftover,
  };
}

export function greedilyTakeTrailingWhiteSpace(
  stream: TokenStream,
  startIndex: number
): {
  trailingSpaces: TokenStream;
  leadingStream: TokenStream;
  splitTrailingString: string | undefined;
} {
  let acc = [];
  let leftover: string | undefined;
  for (let i = startIndex; i >= 0 && i < stream.length; i--) {
    let item = stream[i];

    if (item === undefined) {
      throw new Error(JSON.stringify({ startIndex, i, stream }, null, 2));
    }
    /**
     * take whitespace items (tokens or pure-whitespace strings) from
     *  the end of the stream until we hit something
     */
    if (isWhitespace(item)) {
      acc.unshift(item);
    } else if (typeof item === "string") {
      /**
       * we hit a string that contains some non-whitespace characters,
       *  but still might have some trailing whitespace
       */
      let match = item.match(new RegExp(TRAILING_MD_SPACES, ""));
      if (match) {
        /**
         * found some trailing whitespace
         */
        let [spaces] = match;
        acc.unshift(spaces);
        leftover = item.slice(0, item.length - spaces.length);

        /**
         * this item failed `isWhitespace` so we shouldn't continue from here
         */
        break;
      } else {
        /**
         * nope, no trailing whitespace
         */
        break;
      }
    } else {
      /**
       * non-whitespace token
       */
      break;
    }
  }

  return {
    trailingSpaces: acc,
    leadingStream: stream.slice(0, startIndex - (acc.length - 1)),
    splitTrailingString: leftover,
  };
}

function annotationIsBoldOrItalic(annotation: { type: string }) {
  return ["bold", "italic"].includes(annotation.type);
}

function compactLeadingWhitespace(line: TokenStream): TokenStream {
  let {
    leadingSpaces,
    trailingStream,
    splitLeadingString,
  } = greedilyTakeLeadingWhiteSpace(line, 0);

  if (splitLeadingString) {
    trailingStream.unshift(splitLeadingString);
  }

  if (leadingSpaces.length) {
    return [" ", ...trailingStream];
  } else {
    return trailingStream;
  }
}

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

    let escapedText = escapePunctuation([text], this.options);
    let lines = splitLines(escapedText).map(compactLeadingWhitespace);

    return flattenStreams(intersperse(lines, ["\n"]));
  }

  *root() {
    let stream: TokenStream = flattenStreams(yield);

    return toString(
      removeEmptyInlineTokens(addDelimitersToLists(fixDelimiterRuns(stream)))
    );
  }

  /**
   * Bold text looks like **this** in Markdown.
   *
   * Asterisks are used here because they can split
   * words; underscores cannot split words.
   */
  *Bold(): Iterator<void, TokenStream, TokenStream[]> {
    let inner = flattenStreams(yield);
    return [T.StrongStarStart, ...inner, T.StrongStarEnd];
  }

  /**
   * > A block quote has `>` in front of every line
   * > it is on.
   * >
   * > It can also span multiple lines.
   */
  *Blockquote(): Iterator<void, TokenStream, TokenStream[]> {
    let lines = splitLines(flattenStreams(yield));

    // TODO: should we strip leading / trailing whitespace from this???
    let bq = [];
    for (let line of lines) {
      bq.push(T.BlockquoteLineStart, ...line, T.BlockquoteLineEnd);
    }

    // TODO: Remove `tight` everywhere... maybe not now though
    if (!this.state.tight) {
      bq.push("\n");
    }

    return bq;
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
  *Heading(heading: Heading): Iterator<void, TokenStream, TokenStream[]> {
    let inner = flattenStreams(yield);
    let level = heading.attributes.level;

    // Multiline headings are supported for level 1 and 2
    if (streamIncludes(inner, "\n") || streamIncludes(inner, "&#10;")) {
      if (level === 1 || level === 2) {
        return [
          T.SoftLineBreak,
          ...inner,
          T.SetextHeading(level),
          T.BlockSeparator,
        ];
      }
      // Throw error? Remove newline??
    }

    return [T.ATXHeading(level), ...inner, T.BlockSeparator];
  }

  /**
   * A horizontal rule separates sections of a story
   * ***
   * Into multiple sections.
   */
  *HorizontalRule(): Iterator<void, TokenStream, TokenStream[]> {
    return [T.ThematicBreak("*"), T.BlockSeparator];
  }

  /**
   * Images are embedded like links, but with a `!` in front.
   * ![CommonMark](https://commonmark.org/images/markdown-mark.png)
   */
  *Image(image: Image): Iterator<void, TokenStream, TokenStream[]> {
    return [
      T.Image(
        toString(escapePunctuation([image.attributes.description || ""])),
        image.attributes.url,
        image.attributes.title
      ),
    ];
  }

  /**
   * Italic text looks like *this* in Markdown.
   */
  *Italic(
    italic: Italic,
    context: Context
  ): Iterator<void, TokenStream, TokenStream[]> {
    let underscoreFlag = !!this.state.underscoreFlag;
    this.state.underscoreFlag = !underscoreFlag;

    let inner = flattenStreams(yield);

    this.state.underscoreFlag = underscoreFlag;

    let requiresUnderscore = (a: typeof context.next) => {
      // TODO: do we still want this "make pretty" convenience to disambiguate
      // between adjacent delimiters of the same type?
      // nb. this should be _much_ easier since we have access to the stream.
      return a && annotationIsBoldOrItalic(a);
    };

    let siblingRequiresUnderscore = [context.previous, context.next].some(
      requiresUnderscore
    );

    let parentRequiresUnderscore =
      annotationIsBoldOrItalic(context.parent) &&
      context.parent.start === italic.start &&
      context.parent.end === italic.end;

    if (
      underscoreFlag ||
      siblingRequiresUnderscore ||
      parentRequiresUnderscore
    ) {
      return [T.EmphasisUnderscoreStart, ...inner, T.EmphasisUnderscoreEnd];
    } else {
      return [T.EmphasisStarStart, ...inner, T.EmphasisStarEnd];
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
      return ["\n"];
    }

    return [T.HardLineBreak];
  }

  /**
   * A [link](http://commonmark.org) has the url right next to it in Markdown.
   */
  *Link(link: Link): Iterator<void, TokenStream, TokenStream[]> {
    let inner = flattenStreams(yield);

    return [
      T.InlineLinkStart,
      ...inner,
      T.InlineLinkEnd(link.attributes.url, link.attributes.title),
    ];
  }

  /**
   * A `code` span can be inline or as a block:
   *
   * ```js
   * function () {}
   * ```
   */
  *Code(
    code: Code,
    context: Context
  ): Iterator<void, TokenStream, TokenStream[]> {
    let state = Object.assign({}, this.state);
    Object.assign(this.state, {
      isPreformatted: true,
      htmlSafe: true,
    });

    let inner = flattenStreams(yield);
    this.state = state;

    if (code.attributes.style === "fence") {
      let info = code.attributes.info || "";
      let newlines: typeof T.SoftLineBreak | typeof T.BlockSeparator =
        T.SoftLineBreak;
      if (this.state.isList && context.next) {
        newlines = T.BlockSeparator;
      }

      let fenceType =
        streamIncludes(inner, "```") || info.includes("```")
          ? ("tildes" as const)
          : ("backticks" as const);
      return [
        T.CodeFenceStart(fenceType, info),
        ...inner,
        T.CodeFenceEnd(fenceType),
        newlines,
      ];
    } else if (code.attributes.style === "block") {
      let acc = [];
      for (let line of splitLines(inner)) {
        acc.push(T.CodeBlock, ...line, "\n");
      }

      acc.push("\n");

      return acc;
    } else {
      if (inner.length === 0) {
        return [];
      } else {
        return [T.Code(toString(inner))];
      }
    }
  }

  *Html(html: HTML): Iterator<void, TokenStream, TokenStream[]> {
    let initialState = Object.assign({}, this.state);
    Object.assign(this.state, {
      isPreformatted: true,
      htmlSafe: true,
    });

    let inner = flattenStreams(yield);

    this.state = initialState;

    if (html.attributes.style === "block") {
      return [...inner, "\n"];
    }
    return inner;
  }

  /**
   * A list item is part of an ordered list or an unordered list.
   */
  *ListItem(): Iterator<void, TokenStream, TokenStream[]> {
    let inner = flattenStreams(yield);
    return [T.ListItemStart, ...inner, T.ListItemEnd];

    let digit: number = this.state.digit;
    let delimiter = this.state.delimiter;
    let marker: string = delimiter;
    // TODO: investigate whether we should tokenize the marker
    if (this.state.type === "numbered") {
      marker = `${digit}${delimiter}`;
      this.state.digit++;
    }

    let indent = " ".repeat(marker.length + 1);
    let item = toString(fixDelimiterRuns(inner));

    let firstNonspaceCharacterPosition = 0;
    while (item[firstNonspaceCharacterPosition] === " ")
      firstNonspaceCharacterPosition++;

    let lines: string[] = item.split("\n");
    lines.push((lines.pop() || "").replace(/[ ]+$/, ""));
    lines.unshift((lines.shift() || "").replace(/^[ ]+/, ""));
    let [first, ...rest] = lines;

    item =
      " ".repeat(firstNonspaceCharacterPosition) +
      first +
      "\n" +
      rest
        .map(function leftPad(line) {
          return indent + line;
        })
        .join("\n")
        .replace(/[ ]+$/, "");

    if (this.state.tight) {
      item = item.replace(/([ \n])+$/, "\n");
    }

    // nb. this could be done in the stream, but
    // is p complicated and requires stack knowledge

    // Code blocks using spaces can follow lists,
    // however, they will be included in the list
    // if we don't adjust spacing on the list item
    // to force the code block outside of the list
    // See http://spec.commonmark.org/dingus/?text=%20-%20%20%20hello%0A%0A%20%20%20%20I%27m%20a%20code%20block%20_outside_%20the%20list%0A
    if (this.state.hasCodeBlockFollowing) {
      return [" ", marker, T.CodeBlock, item];
    }
    return [marker, " ", item];
  }

  /**
   * 1. An ordered list contains
   * 2. A number
   * 3. Of things with numbers preceding them
   */
  *List(list: List): Iterator<void, TokenStream, TokenStream[]> {
    let inner = flattenStreams(yield);
    if (list.attributes.type === "numbered") {
      return [
        T.NumberedListStart(list.attributes.startsAt || 1),
        ...inner,
        T.NumberedListEnd,
      ];
    } else {
      return [T.BulletedListStart, ...inner, T.NumberedListEnd];
    }
  }

  /**
   * Paragraphs are delimited by two or more newlines in markdown.
   */
  *Paragraph(): Iterator<void, TokenStream, TokenStream[]> {
    let inner = flattenStreams(yield);
    let escapedNewlines = streamFlatMapStringReplace(
      inner,
      /\n\n/,
      function escapeLineBreaks() {
        return [T.HTMLEntity("#10"), T.HTMLEntity("#10")];
      }
    );

    if (this.state.tight) {
      return [...escapedNewlines, "\n"];
    }

    return [...escapedNewlines, T.BlockSeparator];
  }

  *FixedIndent(): Iterator<void, TokenStream, TokenStream[]> {
    return flattenStreams(yield);
  }
}

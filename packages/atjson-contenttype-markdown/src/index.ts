import * as MarkdownIt from 'markdown-it';
import { Token } from 'markdown-it';
import { Annotation } from 'atjson';

const parser = MarkdownIt();

const TAG_MAP = {
  'p': 'paragraph'
};

export class Parser {

  markdown: string;
  stack: {}[];
  offset: number;
  annotations: Annotation[];

  constructor(markdown: string) {
    this.markdown = markdown;
  }

  parse(): Annotation[] {
    this.reset();
    let tokens = parser.parse(this.markdown, {});
    this.parseTokens(tokens);

    return this.annotations;
  }

  reset(): void {
    this.annotations = [];
    this.stack = [];
    this.offset = 0;
  }

  parseTokens(tokens: Token[]): void {
    for (let i = 0, len = tokens.length; i < len; i++) {
      if (tokens[i].type === 'inline') {
        this.parseTokens(tokens[i].children);
      } else {
        this.parseToken(tokens[i]);
      }
    }
  }

  normalizeToken(token: Token): Token {
    if (TAG_MAP[token.tag]) {
      token.tag = TAG_MAP[token.tag];
    }

    return token;
  }

  parseToken(token: Token): void {

    token = this.normalizeToken(token);

    // open new annotation.
    if (token.nesting === 1) {
      this.startToken(token);

    // close an annotation
    } else if (token.nesting === -1) {
      this.endToken(token);

    // work on current annotation
    } else if (token.nesting === 0) {
      if (token.content.length) {
        this.offset += token.content.length;
      } else if (token.type === 'softbreak') {
        let start = this.offset;
        this.offset = this.findBoL(this.offset);

        this.annotations.push({
          // n.b. the parser *does not give us sufficient information to 100%
          // ascertain the start/end offsets here. We should do something
          // better (e.g., find the actual 'next character', or improve the
          // parser.
          type: 'br', start: start, end: this.offset
        });
      }
    }
  }

  lineToOffset(line: number): number {
    let offset = 0;
    if (line === 0) {
      return 0;
    } else {
      while (line--) offset = this.markdown.indexOf('\n', offset + 1);
      if (offset === -1) {
        return this.markdown.length;
      } else {
        return offset + 1;
      }
    }
  }

  adjustOffset(lineNumber: number): void {
    this.offset = this.lineToOffset(lineNumber);
  }

  adjustStartOffset(map?: [number, number]): void {
    if (map) this.adjustOffset(map[0]);
  }

  adjustEndOffset(map?: [number, number]): void {
    if (map) this.adjustOffset(map[1]);
  }

  // finds the next beginning-of-line (i.e., the first character following a
  // sequence of line breaks)
  findBoL(offset: number): number {
    while (this.markdown[offset] === '\n') offset++;
    return offset;
  }

  startToken(token: Token): void {
    this.adjustStartOffset(token.map);
    this.startParseToken(token);
    this.startParseElement(token);
  }

  startParseToken(token: Token): void {
    if (token.markup.length > 0) {
      this.annotations.push({
        type: 'parse-token',
        tokenType: token.type,
        tag: token.tag,
        start: this.offset,
        end: this.offset + token.markup.length
      });
    }
  }

  startParseElement(token: Token): void {
    this.stack.push({
      start: this.offset,
      type: 'parse-element', 
      tag: token.tag,
      map: token.map
    });

    this.offset += token.markup.length;

    this.stack.push({start: this.offset, type: token.tag});
  }

  endToken(token: Token): void {
    this.endAnnotation(token);
    this.endParseToken(token);
    this.endParseElement(token);
  }

  endAnnotation(token: Token): void {
    let annotation = this.stack.pop();
    annotation.end = this.offset;

    if (annotation.type != token.tag) {
      console.log(annotation, token);
      throw new Error('that was pretty unexpected.');
    }

    this.annotations.push(annotation);
  }

  endParseToken(token: Token): void {
    if (token.markup.length > 0) {
      this.annotations.push({
        type: 'parse-token',
        tokenType: token.type,
        tag: token.tag,
        start: this.offset,
        end: this.offset + token.markup.length
      });
    }
  }

  endParseElement(token: Token): void {
    let parseElement = this.stack.pop();
    if (parseElement.map) {
      this.offset = this.lineToOffset(parseElement.map[1]);
    } else {
      this.offset += token.markup.length;
    }

    if (token.type === 'paragraph_close') {
      this.offset = this.findBoL(this.offset);
    }

    parseElement.end = this.offset;
    delete parseElement.map;

    this.annotations.push(parseElement);
  }
}

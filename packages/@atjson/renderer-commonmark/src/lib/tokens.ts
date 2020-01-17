export function SOFT_LINE_BREAK() {
  return { kind: "SOFT_LINE_BREAK", production: "  \n" } as const;
}

export function LINE_BREAK() {
  return { kind: "LINE_BREAK", production: "\n" } as const;
}

export function BLOCK_SEPARATOR() {
  return { kind: "BLOCK_SEPARATOR", production: "\n\n" } as const;
}

export function THEMATIC_BREAK() {
  return { kind: "THEMATIC_BREAK", production: "***" } as const;
}

export function STRONG_STAR_START() {
  return { kind: "STRONG_STAR_START", production: "**" } as const;
}

export function STRONG_STAR_END() {
  return { kind: "STRONG_STAR_END", production: "**" } as const;
}

export function STRONG_UNDERSCORE_START() {
  return { kind: "STRONG_UNDERSCORE_START", production: "__" } as const;
}

export function STRONG_UNDERSCORE_END() {
  return { kind: "STRONG_UNDERSCORE_END", production: "__" } as const;
}

export function EM_STAR_START() {
  return { kind: "EM_STAR_START", production: "*" } as const;
}

export function EM_STAR_END() {
  return { kind: "EM_STAR_END", production: "*" } as const;
}

export function EM_UNDERSCORE_START() {
  return { kind: "EM_UNDERSCORE_START", production: "_" } as const;
}

export function EM_UNDERSCORE_END() {
  return { kind: "EM_UNDERSCORE_END", production: "_" } as const;
}

export function ANCHOR_TEXT_START() {
  return { kind: "ANCHOR_TEXT_START", production: "[" } as const;
}

export function ANCHOR_TEXT_END_HREF(href: string) {
  return {
    kind: "ANCHOR_TEXT_HREF_SEPARATOR",
    production: `](${href})`
  } as const;
}

export function IMAGE_ALT_TEXT_START() {
  return { kind: "IMAGE_ALT_TEXT_START", production: "![" } as const;
}

export function IMAGE_ALT_TEXT_END_URL(url: string) {
  return {
    kind: "IMAGE_ALT_TEXT_URL_SEPARATOR",
    production: `](${url})`
  } as const;
}

export function ATX_HEADING_1() {
  return { kind: "ATX_HEADING_1", production: "#" } as const;
}

export function ATX_HEADING_2() {
  return { kind: "ATX_HEADING_2", production: "##" } as const;
}

export function ATX_HEADING_3() {
  return { kind: "ATX_HEADING_3", production: "###" } as const;
}

export function ATX_HEADING_4() {
  return { kind: "ATX_HEADING_4", production: "####" } as const;
}

export function ATX_HEADING_5() {
  return { kind: "ATX_HEADING_5", production: "#####" } as const;
}

export function ATX_HEADING_6() {
  return { kind: "ATX_HEADING_6", production: "######" } as const;
}

export function SETEXT_HEADING_1() {
  return { kind: "SETEXT_HEADING_1", production: "====" } as const;
}

export function SETEXT_HEADING_2() {
  return { kind: "SETEXT_HEADING_2", production: "----" } as const;
}

export function CODE_INDENT() {
  return { kind: "CODE_INDENT", production: "    " } as const;
}

export function CODE_FENCE_BACKTICK_START() {
  return { kind: "CODE_FENCE_BACKTICK_START", production: "```" } as const;
}

export function CODE_FENCE_BACKTICK_END() {
  return { kind: "CODE_FENCE_BACKTICK_END", production: "```" } as const;
}

export function CODE_FENCE_TILDE_START() {
  return { kind: "CODE_FENCE_TILDE_START", production: "~~~" } as const;
}

export function CODE_FENCE_TILDE_END() {
  return { kind: "CODE_FENCE_TILDE_END", production: "~~~" } as const;
}

export function CODE_INLINE_BACKTICKS(repeat: number) {
  return {
    kind: "CODE_INLINE_BACKTICKS",
    repeat,
    production: "`"
  } as const;
}

export function NUMBERED_LIST_DELIM_PERIOD() {
  return { kind: "NUMBERED_LIST_DELIM_PERIOD", production: ". " } as const;
}

export function NUMBERED_LIST_DELIM_PAREN() {
  return { kind: "NUMBERED_LIST_DELIM_PAREN", production: ") " } as const;
}

export function BULLETED_LIST_DELIM() {
  return { kind: "BULLETED_LIST_DELIM", production: "* " } as const;
}

export function INDENT_SPACES(indent: number) {
  return {
    kind: "INDENT_SPACES",
    indent,
    production: " "
  } as const;
}

export function BLOCKQUOTE_LINE_START() {
  return { kind: "BLOCKQUOTE_LINE_START", production: "> " } as const;
}

export function TOKENIZE(production: string) {
  return { kind: "CUSTOM_TOKEN", production } as const;
}

export type Token = ReturnType<
  | typeof SOFT_LINE_BREAK
  | typeof LINE_BREAK
  | typeof BLOCK_SEPARATOR
  | typeof THEMATIC_BREAK
  | typeof STRONG_STAR_START
  | typeof STRONG_STAR_END
  | typeof STRONG_UNDERSCORE_START
  | typeof STRONG_UNDERSCORE_END
  | typeof EM_STAR_START
  | typeof EM_STAR_END
  | typeof EM_UNDERSCORE_START
  | typeof EM_UNDERSCORE_END
  | typeof ANCHOR_TEXT_START
  | typeof ANCHOR_TEXT_END_HREF
  | typeof IMAGE_ALT_TEXT_START
  | typeof IMAGE_ALT_TEXT_END_URL
  | typeof ATX_HEADING_1
  | typeof ATX_HEADING_2
  | typeof ATX_HEADING_3
  | typeof ATX_HEADING_4
  | typeof ATX_HEADING_5
  | typeof ATX_HEADING_6
  | typeof SETEXT_HEADING_1
  | typeof SETEXT_HEADING_2
  | typeof CODE_INDENT
  | typeof CODE_FENCE_BACKTICK_START
  | typeof CODE_FENCE_BACKTICK_END
  | typeof CODE_FENCE_TILDE_START
  | typeof CODE_FENCE_TILDE_END
  | typeof CODE_INLINE_BACKTICKS
  | typeof NUMBERED_LIST_DELIM_PERIOD
  | typeof NUMBERED_LIST_DELIM_PAREN
  | typeof BULLETED_LIST_DELIM
  | typeof INDENT_SPACES
  | typeof BLOCKQUOTE_LINE_START
  | typeof TOKENIZE
>;

// enum Token {
//   SOFT_LINE_BREAK, // = '  \n',
//   LINE_BREAK, // = '\n',
//   BLOCK_SEPARATOR, // = '\n\n',
//   THEMATIC_BREAK, // = '***',
//   STRONG_STAR_START, // = '**',
//   STRONG_STAR_END, // = '**',
//   EM_STAR_START, // = '*',
//   EM_STAR_END, // = '*',
//   EM_UNDERSCORE_START, // = '_',
//   EM_UNDERSCORE_END, // = '_',
//   ANCHOR_TEXT_START, // = '[',
//   ANCHOR_TEXT_HREF_SEPARATOR, // = '](',
//   ANCHOR_HREF_END, // = ')',
//   // anchor title ??
//   IMAGE_ALT_TEXT_START, // = '![',
//   IMAGE_ALT_TEXT_URL_SEPARATOR, // = '](',
//   // image title ??
//   IMAGE_URL_END, // = ')',
//   ATX_HEADING_1, // = '#',
//   ATX_HEADING_2, // = '##',
//   ATX_HEADING_3, // = '###',
//   ATX_HEADING_4, // = '####',
//   ATX_HEADING_5, // = '#####',
//   ATX_HEADING_6, // = '######',
//   SETEXT_HEADING_1, // = '===',
//   SETEXT_HEADING_2, // = '---',
//   CODE_INDENT, // = '    ',
//   CODE_FENCE_BACKTICK_START, // = '```',
//   CODE_FENCE_BACKTICK_END, // = '```',
//   CODE_FENCE_TILDE_START, // = '~~~',
//   CODE_FENCE_TILDE_END, // = '~~~',
//   // inline code ?
//   NUMBERED_LIST_DELIM_PERIOD, // = '.',
//   NUMBERED_LIST_DELIM_PAREN, // = ')',
//   BULLETED_LIST_DELIM // = '-'
//   // list indent ?
// }

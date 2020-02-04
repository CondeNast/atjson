import { linkDestination, linkTitle } from "./util";

export function SOFT_LINE_BREAK() {
  return {
    kind: "SOFT_LINE_BREAK",
    production: "\\\n"
  } as const;
}

export function LINE_BREAK() {
  return {
    kind: "LINE_BREAK",
    production: "\n"
  } as const;
}

export function BLOCK_SEPARATOR() {
  return {
    kind: "BLOCK_SEPARATOR",
    production: "\n\n"
  } as const;
}

export function THEMATIC_BREAK() {
  return {
    kind: "THEMATIC_BREAK",
    production: "***"
  } as const;
}

export function STRONG_STAR_START() {
  return {
    kind: "STRONG_STAR_START",
    production: "**"
  } as const;
}

export function STRONG_STAR_END() {
  return {
    kind: "STRONG_STAR_END",
    production: "**"
  } as const;
}

export function STRONG_UNDERSCORE_START() {
  return {
    kind: "STRONG_UNDERSCORE_START",
    production: "__"
  } as const;
}

export function STRONG_UNDERSCORE_END() {
  return {
    kind: "STRONG_UNDERSCORE_END",
    production: "__"
  } as const;
}

export function EM_STAR_START() {
  return {
    kind: "EM_STAR_START",
    production: "*"
  } as const;
}

export function EM_STAR_END() {
  return {
    kind: "EM_STAR_END",
    production: "*"
  } as const;
}

export function EM_UNDERSCORE_START() {
  return {
    kind: "EM_UNDERSCORE_START",
    production: "_"
  } as const;
}

export function EM_UNDERSCORE_END() {
  return {
    kind: "EM_UNDERSCORE_END",
    production: "_"
  } as const;
}

export function ANCHOR_TEXT_START() {
  return {
    kind: "ANCHOR_TEXT_START",
    production: "["
  } as const;
}

export function ANCHOR_TEXT_END_HREF(destination: string, title?: string) {
  return {
    kind: "ANCHOR_TEXT_END_HREF",
    production: `](${linkDestination(destination)}${linkTitle(title)})`
  } as const;
}

export function IMAGE_ALT_TEXT_START() {
  return {
    kind: "IMAGE_ALT_TEXT_START",
    production: "!["
  } as const;
}

export function IMAGE_ALT_TEXT_END_URL(destination: string, title?: string) {
  return {
    kind: "IMAGE_ALT_TEXT_END_URL",
    production: `](${linkDestination(destination)}${linkTitle(title)})`
  } as const;
}

export function ATX_HEADING(level: 1 | 2 | 3 | 4 | 5 | 6) {
  return {
    kind: "ATX_HEADING",
    production: `${Array(level + 1).join("#")} `
  } as const;
}

export function SETEXT_HEADING(level: 1 | 2) {
  return {
    kind: "SETEXT_HEADING",
    production: level === 1 ? "====" : "----"
  } as const;
}

export function CODE_INDENT() {
  return {
    kind: "CODE_INDENT",
    production: "    "
  } as const;
}

export function CODE_FENCE_BACKTICK_START() {
  return {
    kind: "CODE_FENCE_BACKTICK_START",
    production: "```"
  } as const;
}

export function CODE_FENCE_BACKTICK_END() {
  return {
    kind: "CODE_FENCE_BACKTICK_END",
    production: "```"
  } as const;
}

export function CODE_FENCE_TILDE_START() {
  return {
    kind: "CODE_FENCE_TILDE_START",
    production: "~~~"
  } as const;
}

export function CODE_FENCE_TILDE_END() {
  return {
    kind: "CODE_FENCE_TILDE_END",
    production: "~~~"
  } as const;
}

export function CODE_INLINE_BACKTICKS(repeat: number) {
  return {
    kind: "CODE_INLINE_BACKTICKS",
    production: "`".repeat(repeat)
  } as const;
}

export function NUMBERED_LIST_DELIM_PERIOD() {
  return {
    kind: "NUMBERED_LIST_DELIM_PERIOD",
    production: ". "
  } as const;
}

export function NUMBERED_LIST_DELIM_PAREN() {
  return {
    kind: "NUMBERED_LIST_DELIM_PAREN",
    production: ") "
  } as const;
}

export function BULLETED_LIST_DELIM() {
  return {
    kind: "BULLETED_LIST_DELIM",
    production: "* "
  } as const;
}

export function INDENT_SPACES(indent: number) {
  return {
    kind: "INDENT_SPACES",
    production: " ".repeat(indent)
  } as const;
}

export function BLOCKQUOTE_LINE_START() {
  return {
    kind: "BLOCKQUOTE_LINE_START",
    production: "> "
  } as const;
}

export function TOKENIZE(production: string) {
  return {
    kind: "CUSTOM_TOKEN",
    production
  } as const;
}

export function ESCAPED_PUNCTUATION(punctuation: string) {
  return {
    kind: "ESCAPED_PUNCTUATION",
    production: `\\${punctuation}`
  } as const;
}

export function HTML_ENTITY(entityCode: string) {
  return {
    kind: "HTML_ENTITY",
    production: `&${entityCode};`
  } as const;
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
  | typeof ATX_HEADING
  | typeof SETEXT_HEADING
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
  | typeof ESCAPED_PUNCTUATION
  | typeof HTML_ENTITY
>;

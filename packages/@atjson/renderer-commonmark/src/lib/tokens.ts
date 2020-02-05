import {
  getNumberOfRequiredBackticks,
  linkDestination,
  linkTitle
} from "./util";

export const HardLineBreak = {
  kind: "HARD_LINE_BREAK",
  production: "\\\n"
} as const;

export const SoftLineBreak = {
  kind: "SOFT_LINE_BREAK",
  production: "\n"
} as const;

export const BlockSeparator = {
  kind: "BLOCK_SEPARATOR",
  production: "\n\n"
} as const;

export const ThematicBreak = {
  kind: "THEMATIC_BREAK",
  production: "***\n"
} as const;

export const StrongStarStart = {
  kind: "STRONG_STAR_START",
  production: "**"
} as const;

export const StrongStarEnd = {
  kind: "STRONG_STAR_END",
  production: "**"
} as const;

export const StrongUnderscoreStart = {
  kind: "STRONG_UNDERSCORE_START",
  production: "__"
} as const;

export const StrongUnderscoreEnd = {
  kind: "STRONG_UNDERSCORE_END",
  production: "__"
} as const;

export const EmphasisStarStart = {
  kind: "EM_STAR_START",
  production: "*"
} as const;

export const EmphasisStarEnd = {
  kind: "EM_STAR_END",
  production: "*"
} as const;

export const EmphasisUnderscoreStart = {
  kind: "EM_UNDERSCORE_START",
  production: "_"
} as const;

export const EmphasisUnderscoreEnd = {
  kind: "EM_UNDERSCORE_END",
  production: "_"
} as const;

export const InlineLinkStart = {
  kind: "ANCHOR_TEXT_START",
  production: "["
} as const;

export const NoBreakSpace = {
  kind: "NO_BREAK_SPACE",
  production: "&nbsp;"
};

export const EmSpace = {
  kind: "EM_SPACE",
  production: "&emsp;"
};

export function InlineLinkEnd(destination: string, title?: string) {
  return {
    kind: "ANCHOR_TEXT_END_HREF",
    production: `](${linkDestination(destination)}${linkTitle(title)})`
  } as const;
}

export function Image(
  description: string,
  destination: string,
  title?: string
) {
  return {
    kind: "IMAGE",
    production: `![${description}](${linkDestination(destination)}${linkTitle(
      title
    )})`
  } as const;
}

export function ATXHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  return {
    kind: "ATX_HEADING",
    production: `${Array(level + 1).join("#")} `
  } as const;
}

export function SetextHeading(level: 1 | 2) {
  return {
    kind: "SETEXT_HEADING",
    production: level === 1 ? "====" : "----"
  } as const;
}

export const CodeBlock = {
  kind: "CODE_BLOCK",
  production: "    "
} as const;

export function CodeFenceStart(type: "tildes" | "backticks") {
  return {
    kind: "CODE_FENCE_START",
    production: type === "tildes" ? "~~~" : "```"
  } as const;
}

export function CodeFenceEnd(type: "tildes" | "backticks") {
  return {
    kind: "CODE_FENCE_END",
    production: type === "tildes" ? "~~~" : "```"
  } as const;
}

export function Code(snippet: string) {
  // We need to properly escape backticks inside of code blocks
  // by using variable numbers of backticks.
  let repeat = getNumberOfRequiredBackticks(snippet);
  let backticks = Array(repeat + 1).join("`");
  return {
    kind: "CODE",
    production: snippet.length === 0 ? "" : `${backticks}${snippet}${backticks}`
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

export const BlockquoteLineStart = {
  kind: "BLOCKQUOTE_LINE_START",
  production: "> "
} as const;

export const BlockquoteLineEnd = {
  kind: "BLOCKQUOTE_LINE_END",
  production: "\n"
} as const;

export function EscapedPunctuation(punctuation: string) {
  return {
    kind: "ESCAPED_PUNCTUATION",
    production: `\\${punctuation}`
  } as const;
}

export function HTMLEntity(entityCode: string) {
  return {
    kind: "HTML_ENTITY",
    production: `&${entityCode};`
  } as const;
}

export type Token =
  | typeof HardLineBreak
  | typeof SoftLineBreak
  | typeof BlockSeparator
  | typeof ThematicBreak
  | typeof StrongStarStart
  | typeof StrongStarEnd
  | typeof StrongUnderscoreStart
  | typeof StrongUnderscoreEnd
  | typeof EmphasisStarStart
  | typeof EmphasisStarEnd
  | typeof EmphasisUnderscoreStart
  | typeof EmphasisUnderscoreEnd
  | typeof InlineLinkStart
  | typeof CodeBlock
  | typeof NoBreakSpace
  | typeof EmSpace
  | typeof BlockquoteLineStart
  | typeof BlockquoteLineEnd
  | ReturnType<
      | typeof InlineLinkEnd
      | typeof Image
      | typeof ATXHeading
      | typeof SetextHeading
      | typeof CodeFenceStart
      | typeof CodeFenceEnd
      | typeof Code
      | typeof NUMBERED_LIST_DELIM_PERIOD
      | typeof NUMBERED_LIST_DELIM_PAREN
      | typeof BULLETED_LIST_DELIM
      | typeof INDENT_SPACES
      | typeof EscapedPunctuation
      | typeof HTMLEntity
    >;

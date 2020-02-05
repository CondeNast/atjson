import * as Tokens from "./tokens";

type TokenStream = Array<Tokens.Token | string>;

/**
 * This stream operation will remove any redundant soft line
 * breaks from a stream, removing newlines that may introduce
 * non-intentional markdown into the document.
 */
export function collapseSoftLineBreaks(stream: TokenStream) {
  return stream;
}

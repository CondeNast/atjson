type TokenDefinition = (...args: any[]) => { kind: any; value: any };
type Token<T extends TokenDefinition> = T extends TokenDefinition
  ? ReturnType<T>
  : never;

/**
 * A token stream is a collection of strings or tokens
 * that represent markdown syntax. We represent markdown
 * this way so we can programatically fix cases where
 * the markdown that is being produced is invalid.
 *
 * The specific case for this is delimiter runs, which
 * are a fairly nuanced bit of the commonmark spec that
 * describes interaction of punctuation and what makes it
 * valid / invalid per the spec. When generating markdown
 * from a rich text editor, this becomes pretty problematic,
 * since valid atjson (or HTML, for example) can be non-
 * representable in markdown.
 */
type TokenStream<T extends { [key: string]: TokenDefinition }> = T extends {
  [key: string]: infer R;
}
  ? R extends TokenDefinition
    ? Array<Token<R> | string>
    : never
  : never;

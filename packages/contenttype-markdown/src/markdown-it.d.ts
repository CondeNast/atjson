// adapted from: https://github.com/rapropos/typed-markdown-it
declare module 'markdown-it' {
  const MarkdownIt: {
    (preset?: string, options?: MarkdownIt.Options): MarkdownIt.MarkdownIt;
    (options?: MarkdownIt.Options): MarkdownIt.MarkdownIt;
    new (preset?: string, options?: MarkdownIt.Options): MarkdownIt.MarkdownIt;
  };

  namespace MarkdownIt {
    export interface Token {
      attrs: string[][];
      block: boolean;
      children: Token[];
      content: string;
      hidden: boolean;
      info: string;
      level: number;
      map: number[];
      markup: string;
      meta: any;
      nesting: number;
      tag: string;
      type: string;

      attrIndex(attrName: string): number;
      attrJoin(name: string, value: string): void;
      attrPush(attr: string[]): void;
      attrSet(name: string, value: string): void;
    }

    export type InlineRule = (state: any, silent: boolean) => boolean;
    export type InlineRule2 = (state: any) => void;
    export type BlockRule = (state: any, startLine: number, endLine: number, silent: boolean) => boolean;

    export interface Ruler {
      after(afterName: string, ruleName: string, rule: InlineRule | InlineRule2 | BlockRule, options?: any): void;
      at(name: string, rule: InlineRule | InlineRule2 | BlockRule, options?: any): void;
      before(beforeName: string, ruleName: string, rule: InlineRule | BlockRule, options?: any): void;
      disable(rules: string | string[], ignoreInvalid?: boolean): string[];
      enable(rules: string | string[], ignoreInvalid?: boolean): string[];
      enableOnly(rule: string, ignoreInvalid?: boolean): void;
      getRules(chain: string): InlineRule | InlineRule2 | BlockRule[];
      push(ruleName: string, rule: InlineRule | InlineRule2 | BlockRule, options?: any): void;
    }

    export type RendererRule = (tokens: Token[], index: number, options: any, env: any, self: Renderer) => string;

    export interface Renderer {
      rules: { [tokenType: string]: RendererRule };
      render(tokens: Token[], options: any, env: any): string;
      renderAttrs(token: Token): string;
      renderInline(tokens: Token[], options: any, env: any): string;
      renderToken(tokens: Token[], idx: number, options?: any): string;
    }

    export interface ParserBlock {
      ruler: Ruler;
      parse(src: string, md: MarkdownIt, env: any, outTokens: Token[]): void;
    }

    export interface Core {
      ruler: Ruler;
      process(state: any): void;
    }

    export interface ParserInline {
      ruler: Ruler;
      ruler2: Ruler;
      parse(src: string, md: MarkdownIt, env: any, outTokens: Token[]): void;
    }

    export interface Options {
      options: {
        html?: boolean;
        xhtmlOut?: boolean;
        breaks?: boolean;
        langPrefix?: string;
        linkify?: boolean;
        typographer?: boolean;
        quotes?: string | string[];
        highlight?: ((str: string, lang: string) => string) | null;
        maxNesting?: number;
        components?: any;
      };
      components: any;
    }

    export interface MarkdownIt {
      block: ParserBlock;
      core: Core;
      helpers: any;
      inline: ParserInline;
      linkify: any;
      renderer: Renderer;
      utils: any;

      options: any;
      normalizeLink: (url: string) => string;
      normalizeLinkText: (url: string) => string;
      validateLink: (url: string) => string;

      disable(rules: string | string[], ignoreInvalid?: boolean): MarkdownIt;
      enable(rules: string | string[], ignoreInvalid?: boolean): MarkdownIt;
      parse(src: string, env: any): Token[];
      parseInline(src: string, env: any): Token[];
      renderInline(src: string, env: any): string;
      use(plugin: any): MarkdownIt;
      render(src: string, env?: any): string;
    }
  }

  export = MarkdownIt;
}

import Document, { serialize, Block, Mark } from "@atjson/document";
import { createTree, extractSlices, ROOT } from "@atjson/util";

interface Mapping {
  [key: string]: string;
}

const escape: Mapping = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

type EscapeCharacter = keyof Mapping;

function doEscape(chr: EscapeCharacter) {
  return escape[chr];
}

export function escapeHTML(text: string): string {
  return text.replace(/[&<>"'`=]/g, doEscape);
}

function flatten<T>(array: Array<T | T[]>): T[] {
  let flattenedArray = [];
  for (let i = 0, len = array.length; i < len; i++) {
    let item = array[i];
    if (Array.isArray(item)) {
      flattenedArray.push(...flatten(item));
    } else if (item != null) {
      flattenedArray.push(item);
    }
  }
  return flattenedArray;
}

function classifyWord(word: string) {
  if (word.length > 0) {
    return word[0].toUpperCase() + word.slice(1);
  }
  return "";
}

// This classify is _specifically_ for our annotation types—
// casing is ignored, and dashes are the only thing allowed.
export function classify(type: string) {
  return type.toLowerCase().split("-").map(classifyWord).join("");
}

export interface Context {
  parent: Block | Mark | null;
  previous: Block | Mark | string | null;
  next: Block | Mark | string | null;
  children: Array<Block | Mark | string>;
  document: {
    text: string;
    blocks: Block[];
    marks: Mark[];
  };
}

function compile(
  renderer: Renderer,
  value: Block | Mark | null,
  map: Record<string, Array<Block | Mark | string>>,
  key: string,
  context: Partial<Context> & {
    document: {
      text: string;
      blocks: Block[];
      marks: Mark[];
    };
  }
): any {
  let children = map[key] ?? [];
  let generator: Iterator<void, any, any[]>;

  if (value == null) {
    generator = renderer.root();
  } else {
    if ("parents" in value) {
      generator = renderer.renderBlock(value, {
        ...context,
        children,
      } as Context);
    } else {
      generator = renderer.renderMark(value, {
        ...context,
        children,
      } as Context);
    }
  }

  let result = generator.next();
  if (result.done) {
    return result.value;
  }

  return generator.next(
    flatten(
      children.map(function compileChildNode(child, idx) {
        let childContext = {
          parent: value || null,
          previous: children[idx - 1] || null,
          next: children[idx + 1] || null,
          document: context.document,
        };

        if (typeof child === "string") {
          return renderer.text(child, {
            ...childContext,
            children: [],
          });
        }

        return compile(renderer, child, map, child.id, childContext) as any[];
      })
    )
  ).value;
}

export default class Renderer {
  static render<T extends typeof Renderer>(
    this: T,
    ...params: ConstructorParameters<T>
  ) {
    let document = params[0];
    if (document == null) {
      return;
    }
    let renderer = new this(document, ...params.slice(1));
    let [remainder, slices] = extractSlices(
      document instanceof Document
        ? serialize(document, { onUnknown: "throw" })
        : document
    );
    renderer.slices = slices as Record<
      string,
      { text: string; marks: Mark[]; blocks: Block[] }
    >;
    return compile(
      renderer,
      null,
      createTree(remainder) as Record<string, Array<Block | Mark | string>>,
      ROOT,
      {
        document: remainder as { text: string; marks: Mark[]; blocks: Block[] },
      }
    );
  }

  private slices: Record<
    string,
    { text: string; marks: Mark[]; blocks: Block[] }
  >;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  constructor(
    _document:
      | Document
      | { text: string; marks: Mark[]; blocks: Block[] }
      | null,
    ..._args: any[]
  ) {
    this.slices = {};
  }

  *renderBlock(block: Block, context: Context): Iterator<void, any, any> {
    let generator =
      (this as any)[block.type] || (this as any)[classify(block.type)];
    if (generator) {
      return yield* generator.call(this, block, context);
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        `[${this.constructor.name}]: No handler present for block of type ${block.type}. Possibly important information has been dropped.`
      );
      // eslint-disable-next-line no-console
      console.debug("Unsupported block:", block);
      return yield;
    }
  }

  *renderMark(mark: Mark, context: Context): Iterator<void, any, any> {
    let generator =
      (this as any)[mark.type] || (this as any)[classify(mark.type)];
    if (generator) {
      return yield* generator.call(this, mark, context);
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        `[${this.constructor.name}]: No handler present for mark of type ${mark.type}. Possibly important information has been dropped.`
      );
      // eslint-disable-next-line no-console
      console.debug("Unsupported mark:", mark);
      return yield;
    }
  }

  /**
   * Get a slice document by the `SliceAnnotation` id.
   * Useful for grabbing slices like captions / credit / etc
   * and rendering them in place.
   *
   * @param sliceId The id of the slice to return
   * @returns The slice document or null if there's no slices that match
   */
  getSlice(sliceId: string) {
    return this.slices[sliceId] ?? null;
  }

  *root(): Iterator<void, any, any> {
    return yield;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  text(text: string, _: Context) {
    return text;
  }
}

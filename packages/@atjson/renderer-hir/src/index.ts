import Document, { Annotation, AnnotationJSON } from "@atjson/document";
import { HIR, HIRNode, TextAnnotation } from "@atjson/hir";

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
  "=": "&#x3D;"
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
  return type
    .toLowerCase()
    .split("-")
    .map(classifyWord)
    .join("");
}

export interface Context {
  parent: Annotation<any>;
  previous: Annotation<any> | (AnnotationJSON & { toJSON(): object }) | null;
  next: Annotation<any> | (AnnotationJSON & { toJSON(): object }) | null;
  children: Array<Annotation<any>>;
  document: Document;
}

function isTextAnnotation(a: Annotation<any>): a is TextAnnotation {
  return (
    a.getAnnotationConstructor().vendorPrefix === "atjson" && a.type === "text"
  );
}

function getChildNodeAnnotations(childNode: HIRNode) {
  if (isTextAnnotation(childNode.annotation)) {
    return {
      type: "text",
      start: childNode.start,
      end: childNode.end,
      attributes: {
        text: childNode.text
      },
      toJSON(): object {
        return {
          id: "Any<id>",
          type: "-atjson-text",
          start: childNode.start,
          end: childNode.end,
          attributes: {
            "-atjson-text": childNode.text
          }
        };
      }
    };
  } else {
    return childNode.annotation;
  }
}

function compile(
  renderer: Renderer,
  node: HIRNode,
  context: Partial<Context> & { document: Document }
): any {
  let annotation = node.annotation;
  let childNodes = node.children();

  let childAnnotations = childNodes.map(getChildNodeAnnotations);
  let generator: Iterator<void, any, any[]>;

  if (context.parent == null) {
    generator = renderer.root();
  } else {
    generator = renderer.renderAnnotation(annotation, {
      ...context,
      children: childAnnotations
    } as Context);
  }

  let result = generator.next();
  if (result.done) {
    return result.value;
  }

  return generator.next(
    flatten(
      childNodes.map(function compileChildNode(
        childNode: HIRNode,
        idx: number
      ) {
        let childContext = {
          parent: annotation || null,
          previous: childAnnotations[idx - 1] || null,
          next: childAnnotations[idx + 1] || null,
          document: context.document
        };

        if (childNode.type === "text") {
          return renderer.text(childNode.text, {
            ...childContext,
            children: []
          });
        }

        return compile(renderer, childNode, childContext) as any[];
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
    let renderer = new this(document, ...params.slice(1));

    return compile(renderer, new HIR(document).rootNode, { document });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  constructor(_document: Document, ..._args: any[]) {}

  *renderAnnotation(
    annotation: Annotation<any>,
    context: Context
  ): Iterator<void, any, any> {
    let generator =
      (this as any)[annotation.type] ||
      (this as any)[classify(annotation.type)];
    if (generator) {
      return yield* generator.call(this, annotation, context);
    }
    return yield;
  }

  *root(): Iterator<void, any, any[]> {
    return yield;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  text(text: string, _: Context): string {
    return text;
  }
}

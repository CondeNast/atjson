import Document, { Annotation, AnnotationJSON } from '@atjson/document';
import { HIR, HIRNode, TextAnnotation } from '@atjson/hir';

interface Mapping {
  [key: string]: string;
}

const escape: Mapping = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#x27;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

type EscapeCharacter = keyof Mapping;

export function escapeHTML(text: string): string {
  return text.replace(/[&<>"'`=]/g, (chr: EscapeCharacter) => escape[chr]);
}

function flatten(array: any[]): any[] {
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

// This classify is _specifically_ for our annotation types—
// casing is ignored, and dashes are the only thing allowed.
export function classify(type: string) {
  return type.toLowerCase().split('-').map(word => {
    if (word.length > 0) {
      return word[0].toUpperCase() + word.slice(1);
    }
    return '';
  }).join('');
}

export interface Context {
  parent: Annotation;
  previous: Annotation | (AnnotationJSON & { toJSON(): object; }) | null;
  next: Annotation | (AnnotationJSON & { toJSON(): object; }) | null;
  children: Annotation[];
  document: Document;
}

function compile(renderer: Renderer, node: HIRNode, context: Partial<Context>): any {
  let annotation = node.annotation;
  let childNodes = node.children();
  let childAnnotations = childNodes.map(childNode => {
    if (childNode.annotation instanceof TextAnnotation) {
      return {
        type: 'text',
        start: childNode.start,
        end: childNode.end,
        attributes: {
          text: childNode.text
        },
        toJSON(): object {
          return {
            id: 'Any<id>',
            type: '-atjson-text',
            start: childNode.start,
            end: childNode.end,
            attributes: {
              '-atjson-text': childNode.text
            }
          };
        }
      };
    } else {
      return childNode.annotation;
    }
  });
  let generator;

  if (context.parent == null) {
    generator = renderer.root();
  } else {
    generator = renderer.renderAnnotation(annotation!, {
      ...context,
      children: childAnnotations
    } as Context);
  }

  let result = generator.next();
  if (result.done) {
    return result.value;
  }

  return generator.next(flatten(childNodes.map((childNode: HIRNode, idx: number) => {
    let childContext = {
      parent: annotation! || null,
      previous: childAnnotations[idx - 1] || null,
      next: childAnnotations[idx + 1] || null,
      document: context.document!
    };

    if (childNode.type === 'text') {
      return renderer.text(childNode.text, {
        ...childContext,
        children: []
      });
    } else {
      return compile(renderer, childNode, childContext);
    }
  }))).value;
}

export default class Renderer {

  static render<T extends typeof Renderer>(this: T, ...params: ConstructorParameters<T>) {
    let document = params[0];
    let renderer = new this(document, ...params.slice(1));

    return compile(renderer, new HIR(document).rootNode, { document });
  }

  // tslint:disable-next-line:no-empty
  constructor(_document: Document, ..._args: any[]) {}

  *renderAnnotation(annotation: Annotation, context: Context): IterableIterator<any> {
    let generator = (this as any)[annotation.type] || (this as any)[classify(annotation.type)];
    if (generator) {
      return yield* generator.call(this, annotation, context);
    }
    return yield;
  }

  *root(): IterableIterator<any> {
    return yield;
  }

  text(text: string, _: Context): string {
    return text;
  }
}

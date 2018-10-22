import Document, { Annotation } from '@atjson/document';
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

export interface Context {
  parent: Annotation;
  previous: Annotation | null;
  next: Annotation | null;
  children: Annotation[];
}

function compile(renderer: Renderer, node: HIRNode, parent?: Annotation, previous?: Annotation, next?: Annotation): any {
  let annotation = node.annotation;
  let childNodes = node.children();
  let childAnnotations = childNodes.map(childNode => childNode.annotation);
  let generator;

  if (parent == null) {
    generator = renderer.root();
  } else {
    generator = renderer.renderAnnotation(annotation, {
      parent,
      previous: previous || null,
      next: next || null,
      children: childAnnotations
    });
  }

  let result = generator.next();
  if (result.done) {
    return result.value;
  }

  return generator.next(flatten(childNodes.map((childNode: HIRNode, idx: number) => {
    if (childNode.annotation instanceof TextAnnotation) {
      return renderer.text(childNode.annotation.attributes.text);
    } else {
      return compile(renderer, childNode, annotation, childAnnotations[idx - 1], childAnnotations[idx + 1]);
    }
  }))).value;
}

export default class Renderer {

  *renderAnnotation(annotation: Annotation, context: Context): IterableIterator<any> {
    let generator = (this as any)[annotation.type];
    if (generator) {
      return yield* generator.call(this, annotation, context);
    }
    return yield;
  }

  *root(): IterableIterator<any> {
    return yield;
  }

  text(text: string): string {
    return text;
  }

  render(document: Document | HIR) {
    if (document instanceof HIR) {
      return compile(this, document.rootNode);
    }
    return compile(this, new HIR(document).rootNode);
  }
}

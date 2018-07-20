import Document, { AnyAnnotation } from '@atjson/document';
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

function compile(renderer: Renderer, node: HIRNode, parent?: AnyAnnotation, index?: number): any {
  let annotation: AnyAnnotation = node.annotation.clone();
  let children = node.children();

  // Add metadata to annotations for formats that require context
  // when rendering
  annotation.parent = parent || null;
  annotation.previous = null;
  annotation.next = null;

  if (parent && index != null && index > 0) {
    annotation.previous = parent.children[index - 1];
    if (annotation.previous == null ||
        typeof annotation.previous === 'string') {
      annotation.previous = null;
    }
  }

  if (parent && index != null && index < parent.children.length) {
    annotation.next = parent.children[index + 1];
    if (annotation.next == null ||
        typeof annotation.next === 'string') {
      annotation.next = null;
    }
  }

  annotation.children = children.map(childNode => {
    if (childNode.annotation instanceof TextAnnotation) {
      return childNode.annotation.attributes.text;
    } else {
      return childNode.annotation;
    }
  });

  let generator = renderer.renderAnnotation(annotation);
  let result = generator.next();
  if (result.done) {
    return result.value;
  }

  return generator.next(flatten(children.map((childNode: HIRNode, idx: number) => {
    if (childNode.annotation instanceof TextAnnotation) {
      return renderer.text(childNode.annotation.attributes.text);
    } else {
      return compile(renderer, childNode, annotation, idx);
    }
  }))).value;
}

export default class Renderer {

  *renderAnnotation(annotation: AnyAnnotation): IterableIterator<any> {
    let generator = (this as any)[annotation.type];
    if (generator) {
      return yield* generator.call(this, annotation);
    }
    return yield;
  }

  text(text: string): string {
    return text;
  }

  render(document: Document) {
    return compile(this, new HIR(document).rootNode);
  }
}

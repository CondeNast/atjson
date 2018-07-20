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

function compile(renderer: Renderer, node: HIRNode): any {
  let annotation: AnyAnnotation = node.annotation;
  let generator = renderer.renderAnnotation(annotation);
  let result = generator.next();
  if (result.done) {
    return result.value;
  }

  let children = node.children();
  return generator.next(flatten(children.map((childNode: HIRNode) => {
    if (childNode.annotation instanceof TextAnnotation) {
      return renderer.text(childNode.annotation.attributes.text);
    } else {
      return compile(renderer, childNode);
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

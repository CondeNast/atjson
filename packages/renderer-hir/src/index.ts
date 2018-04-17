import Document from '@atjson/document';
import { HIR, HIRNode } from '@atjson/hir';

type Mapping = {
  [key: string]: string;
};

const escape: Mapping = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
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
  let generator = renderer.renderAnnotation(node);
  let result = generator.next();
  if (result.done) {
    return result.value;
  }

  let children = node.children();
  return generator.next(flatten(children.map((childNode: HIRNode) => {
    if (childNode.type === 'text' && typeof childNode.text === 'string') {
      return renderer.renderText(childNode.text);
    } else {
      return compile(renderer, childNode);
    }
  }))).value;
}

export default class Renderer {

  *renderAnnotation(annotation: HIRNode): IterableIterator<any> {
    let generator = (<any>this)[annotation.type];
    if (generator) {
      return yield* generator.call(this, annotation.attributes);
    }
    return yield;
  }

  renderText(text: string): string {
    return text;
  }

  render(document: Document) {
    return compile(this, new HIR(document).rootNode);
  }
}

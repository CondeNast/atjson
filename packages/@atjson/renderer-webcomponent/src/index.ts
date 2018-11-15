import { Annotation, AnnotationConstructor } from '@atjson/document';
import Renderer, { escapeHTML } from '@atjson/renderer-hir';

class WebComponentRenderer extends Renderer {

  text(text: string) {
    return document.createTextNode(escapeHTML(text));
  }

  *root() {
    let story: HTMLElement = document.createElement('div');
    story.classList.add('editor');
    story.contentEditable = 'true';
    let children = yield;
    story.append(...children);
    return story;
  }

  *renderAnnotation(annotation: Annotation): IterableIterator<any> {
    let Constructor = annotation.constructor as AnnotationConstructor;
    let element = document.createElement(`${Constructor.vendorPrefix}-${annotation.type}`);
    element.setAttribute('data-annotation-id', annotation.id);
    (element as any).annotation = annotation;

    let children = yield;
    element.append(...children);
    return element;
  }
}

export default WebComponentRenderer;

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
    story.setAttribute('style', 'white-space: pre-wrap');
    let children = yield;
    (story as any).append(...children);
    return story;
  }

  *renderAnnotation(annotation: Annotation): IterableIterator<any> {
    let Constructor = annotation.constructor as AnnotationConstructor;
    let Component = Constructor.component;
    let element: HTMLElement = Component ? Component() :
                  document.createElement(`${Constructor.vendorPrefix}-${annotation.type}`);
    element.setAttribute('data-annotation-id', annotation.id);
    (element as any).annotation = annotation;

    let children = yield;
    (element as any).append(...children);
    return element;
  }
}

export default WebComponentRenderer;

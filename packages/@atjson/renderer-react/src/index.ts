import Document, { Annotation } from '@atjson/document';
import Renderer, { classify } from '@atjson/renderer-hir';
import * as React from 'react';

export interface ComponentLookup {
  [key: string]: React.StatelessComponent<any> | React.ComponentClass<any>;
}

// @ts-ignore
export default class ReactRenderer extends Renderer {

  static render(document: Document, components: ComponentLookup) {
    // @ts-ignore
    return super.render(document, components);
  }

  private componentLookup: ComponentLookup;

  constructor(componentLookup: ComponentLookup) {
    super();
    this.componentLookup = componentLookup;
  }

  *root() {
    let AnnotationComponent = this.componentLookup.root || this.componentLookup.Root;
    if (AnnotationComponent) {
      return React.createElement(
        AnnotationComponent,
        {},
        ...yield
      );
    } else {
      let components = yield;
      return components;
    }
  }

  *renderAnnotation(annotation: Annotation): IterableIterator<React.Component | void> {
    let AnnotationComponent = this.componentLookup[annotation.type] || this.componentLookup[classify(annotation.type)];
    if (AnnotationComponent) {
      return React.createElement(
        AnnotationComponent,
        annotation.attributes,
        ...yield
      );
    } else {
      // console.warn(`No component found for "${node.type}"- content will be yielded`);
      let components = yield;
      return components;
    }
  }
}

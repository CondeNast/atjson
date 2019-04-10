import Document, { Annotation } from '@atjson/document';
import Renderer, { classify } from '@atjson/renderer-hir';
import * as React from 'react';

export interface ComponentLookup {
  [key: string]: React.StatelessComponent | React.ComponentClass;
}

export default class ReactRenderer extends Renderer {

  static render(document: Document, components: ComponentLookup) {
    return super.render(document, components);
  }

  private componentLookup: ComponentLookup;

  constructor(componentLookup: ComponentLookup) {
    super();
    this.componentLookup = componentLookup;
  }

  registerComponent(type: string, component: React.StatelessComponent | React.ComponentClass) {
    this.componentLookup[type] = component;
  }

  unregisterComponent(type: string) {
    delete this.componentLookup[type];
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

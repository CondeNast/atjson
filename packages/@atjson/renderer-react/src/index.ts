import { Annotation } from '@atjson/document';
import Renderer from '@atjson/renderer-hir';
import * as React from 'react';

export interface Component {
  new (...args: any[]): React.Component;
}

export type StatelessComponent = (...args: any[]) => any;

export interface ComponentLookup {
  [key: string]: Component | StatelessComponent;
}

export default class ReactRenderer extends Renderer {
  private componentLookup: ComponentLookup;

  constructor(componentLookup: ComponentLookup) {
    super();
    this.componentLookup = componentLookup;
  }

  registerComponent(type: string, component: Component | StatelessComponent) {
    this.componentLookup[type] = component;
  }

  unregisterComponent(type: string) {
    delete this.componentLookup[type];
  }

  *renderAnnotation(annotation: Annotation): IterableIterator<React.Component | void> {
    let AnnotationComponent = this.componentLookup[annotation.type];
    if (AnnotationComponent) {
      return React.createElement(
        AnnotationComponent,
        annotation.attributes,
        ...yield
      );
    } else {
      // console.warn(`No component found for "${node.type}"- content will be yielded`);
      return;
    }
  }
}

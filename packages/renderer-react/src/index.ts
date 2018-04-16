import { HIRNode } from '@atjson/hir';
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

  *renderAnnotation(node: HIRNode): IterableIterator<React.Component | void> {
    let AnnotationComponent = this.componentLookup[node.type];
    if (AnnotationComponent) {
      return React.createElement(
        AnnotationComponent,
        node.attributes,
        ...yield
      );
    } else {
      // console.warn(`No component found for "${node.type}"- content will be yielded`);
      return;
    }
  }
}

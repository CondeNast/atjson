/// <amd-module name="@atjson/renderer-react"/>
import { HIRNode } from '@atjson/hir';
import Renderer from '@atjson/renderer-hir';
import * as React from 'react';

interface Component {
  new (...args: any[]): React.Component;
}

type StatelessComponent = (...args: any[]) => any;

interface ComponentLookup {
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

  willRender() {
    this.pushScope({
      componentLookup: this.componentLookup
    });
  }

  *renderAnnotation(annotation: HIRNode): IterableIterator<React.Component | void> {
    let AnnotationComponent = this.componentLookup[annotation.type];
    if (AnnotationComponent) {
      return React.createElement(
        AnnotationComponent,
        annotation.attributes,
        ...yield
      );
    } else {
      // console.warn(`No component found for "${annotation.type}"- content will be yielded`);
      return;
    }
  }
}

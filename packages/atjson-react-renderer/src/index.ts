import Renderer from 'atjson-renderer';
import React from 'react';

interface Component {
  new (...args: any[]): React.Component
}

interface ComponentLookup {
  [key: string]: Component|function
}

export default class ReactRenderer extends Renderer {
  private componentLookup: ComponentLookup;

  constructor(componentLookup: ComponentLookup) {
    super();
    this.componentLookup = componentLookup;
  }

  registerComponent(type: string, component: Component|function) {
    this.componentLookup[type] = component;
  }

  unregisterComponent(type: string) {
    this.componentLookup[type] = null;
  }

  willRender() {
    this.pushScope({
      componentLookup: this.componentLookup
    });
  }

  *renderAnnotation(annotation) {
    let AnnotationComponent = this.componentLookup[annotation.type];
    if (AnnotationComponent) {
      return React.createElement(
        AnnotationComponent,
        annotation.attributes,
        ...yield
      );
    } else {
      console.error(`No component found for "${annotation.type}"- content will be yielded`);
      return ;
    }
  }
}

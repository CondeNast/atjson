import Renderer from 'atjson-renderer';
import React from 'react';

interface Component {
  new (...args: any[]): React.Component
}

interface ComponentLookup {
  [key: string]: Component|function
}

class ReactRenderer implements Renderer {
  private componentMap: ComponentLookup;

  constructor(componentMap: ComponentLookup) {
    super();
    this.componentMap = componentMap;
  }

  registerComponent(type: string, component: Component|function) {
    this.componentMap[type] = component;
  }

  unregisterComponent(type: string) {
    this.componentMap[type] = null;
  }

  *renderAnnotation(annotation) {
    let AnnotationComponent = this.componentMap[annotation.type];
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

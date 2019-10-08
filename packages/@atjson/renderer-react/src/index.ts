import Document, { Annotation } from "@atjson/document";
import Renderer, { classify } from "@atjson/renderer-hir";
import * as React from "react";
import { ComponentType } from "react";

export default class ReactRenderer extends Renderer {
  private componentLookup: {
    [key: string]: ComponentType<any>;
  };

  constructor(
    document: Document<any>,
    componentLookup: {
      [key: string]: ComponentType<any>;
    }
  ) {
    super(document);
    this.componentLookup = componentLookup;
  }

  *root() {
    let AnnotationComponent =
      this.componentLookup.root || this.componentLookup.Root;
    if (AnnotationComponent) {
      return React.createElement(AnnotationComponent, {}, ...(yield));
    } else {
      let components = yield;
      return components;
    }
  }

  *renderAnnotation(
    annotation: Annotation
  ): IterableIterator<React.Component | void> {
    let AnnotationComponent =
      this.componentLookup[annotation.type] ||
      this.componentLookup[classify(annotation.type)];
    if (AnnotationComponent) {
      return React.createElement(
        AnnotationComponent,
        annotation.attributes,
        ...(yield)
      );
    } else {
      // console.warn(`No component found for "${node.type}"- content will be yielded`);
      let components = yield;
      return components;
    }
  }
}

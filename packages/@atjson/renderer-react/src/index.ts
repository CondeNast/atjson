import Document, { Annotation } from "@atjson/document";
import Renderer, { classify } from "@atjson/renderer-hir";
import * as React from "react";
import { ComponentType, ReactElement } from "react";

export default class ReactRenderer extends Renderer {
  private componentLookup: {
    [key: string]: ComponentType<any>;
  };

  constructor(
    document: Document,
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

  renderSubdocuments(annotation: Annotation) {
    if (!annotation.constructor.subdocuments) {
      return;
    }

    for (let subdocKey in annotation.constructor.subdocuments) {
      if (!(subdocKey in annotation.attributes)) {
        continue;
      }

      // we want an empty root for nested docs, use React.Fragment as Root
      const componentLookup = Object.assign(
        {},
        {
          ...this.componentLookup,
          Root: React.Fragment
        }
      );
      annotation.attributes[subdocKey] = this.constructor.render(
        annotation.attributes[subdocKey],
        componentLookup
      );
    }
  }

  *renderAnnotation(
    annotation: Annotation
  ): Iterator<void, ReactElement | ReactElement[], ReactElement[]> {
    this.renderSubdocuments(annotation);

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

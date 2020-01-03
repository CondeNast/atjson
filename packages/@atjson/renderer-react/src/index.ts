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

  renderSubdocuments(annotation: Annotation<any>): void {
    const annotationConstructor = annotation.getAnnotationConstructor();

    if (!annotationConstructor.subdocuments) {
      return;
    }

    // go through each subdoc-supporting attribute, rendering it
    for (let subdocKey in annotationConstructor.subdocuments) {
      if (!(subdocKey in annotation.attributes)) {
        continue;
      }

      // we want an empty root for nested docs, use React.Fragment as Root
      const subdocComponents = Object.assign(
        {},
        {
          ...this.componentLookup,
          Root: React.Fragment
        }
      );
      annotation.attributes[subdocKey] = ReactRenderer.render(
        annotation.attributes[subdocKey],
        subdocComponents
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

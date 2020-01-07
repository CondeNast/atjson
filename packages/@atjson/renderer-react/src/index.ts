import Document, { Annotation } from "@atjson/document";
import Renderer, { classify } from "@atjson/renderer-hir";
import * as React from "react";
import { ReactElement } from "react";

// Make a React-aware AttributesOf for subdocuments rendered into Fragments
export type AttributesOf<AnnotationClass> = AnnotationClass extends Annotation<
  infer Attributes
>
  ? {
      [P in keyof Attributes]: Attributes[P] extends Document
        ? React.ReactFragment
        : Attributes[P];
    }
  : never;

const ReactRendererContext = React.createContext();

export const ReactRendererConsumer = ReactRendererContext.Consumer;

export const ReactRendererProvider = ({ children, value }) => {
  return React.createElement(ReactRendererConsumer, {}, parentComponentMap => {
    const mergedValues = Object.assign({}, parentComponentMap, value);
    return React.createElement(
      ReactRendererContext.Provider,
      { value: mergedValues },
      children
    );
  });
};

export default class ReactRenderer extends Renderer {
  *root() {
    return React.createElement(React.Fragment, {}, ...(yield));
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

      annotation.attributes[subdocKey] = ReactRenderer.render(
        annotation.attributes[subdocKey]
      );
    }
  }

  *renderAnnotation(
    annotation: Annotation
  ): Iterator<void, ReactElement | ReactElement[], ReactElement[]> {
    this.renderSubdocuments(annotation);

    const children = yield;
    const key = `${annotation.id}-${annotation.start}`;

    return React.createElement(ReactRendererConsumer, { key }, value => {
      let AnnotationComponent =
        value[annotation.type] || value[classify(annotation.type)];

      if (AnnotationComponent) {
        return React.createElement(
          AnnotationComponent,
          annotation.attributes,
          children
        );
      } else {
        return children;
      }
    });
  }
}

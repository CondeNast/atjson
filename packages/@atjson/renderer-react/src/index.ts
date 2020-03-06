import Document, { Annotation } from "@atjson/document";
import Renderer, { classify } from "@atjson/renderer-hir";
import * as React from "react";
import { ComponentType, FC, ReactElement } from "react";

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

// assigning this to a var so we can check equality with this (to throw when a
// user of the library has not wrapped in a provider).
const EMPTY_COMPONENT_MAP = {};

export const ReactRendererContext = React.createContext<{
  [key: string]: ComponentType<any>;
}>(EMPTY_COMPONENT_MAP);

export const ReactRendererConsumer = ReactRendererContext.Consumer;

export const ReactRendererProvider: FC<{
  value: { [key: string]: ComponentType<any> };
}> = ({ children, value }) => {
  return React.createElement(
    ReactRendererConsumer,
    null,
    (parentComponentMap: { [key: string]: ComponentType<any> }) => {
      const mergedValues = { ...parentComponentMap, ...value };
      return React.createElement(
        ReactRendererContext.Provider,
        { value: mergedValues },
        children
      );
    }
  );
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

    const annotationChildren = yield;
    const key = `${annotation.id}-${annotation.start}`;

    return React.createElement(ReactRendererConsumer, {
      key,
      children: (componentMap: { [key: string]: ComponentType<any> }) => {
        if (componentMap === EMPTY_COMPONENT_MAP) {
          throw new Error(
            "Component map is empty. Did you wrap your render call in ReactRendererProvider?"
          );
        }

        let AnnotationComponent =
          componentMap[annotation.type] ||
          componentMap[classify(annotation.type)];

        if (AnnotationComponent) {
          return React.createElement(
            AnnotationComponent,
            annotation.attributes,
            ...annotationChildren
          );
        } else {
          return annotationChildren;
        }
      }
    });
  }
}

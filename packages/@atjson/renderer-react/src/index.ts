import Document, { Annotation, is } from "@atjson/document";
import type { JSON } from "@atjson/document";
import { HIR, HIRNode, TextAnnotation } from "@atjson/hir";
import { classify } from "@atjson/renderer-hir";
import * as React from "react";
import {
  createElement,
  ComponentType,
  Fragment,
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
} from "react";

/**
 * Make a React-aware AttributesOf for subdocuments rendered into Fragments
 * @deprecated use `PropsOf` instead
 */
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

const SliceContext = React.createContext<{
  slices: Record<string, Document>;
  includeParseTokens: boolean;
}>({ slices: {}, includeParseTokens: false });

export const ReactRendererContext = React.createContext<{
  [key: string]: ComponentType<any>;
}>(EMPTY_COMPONENT_MAP);

export const ReactRendererConsumer = ReactRendererContext.Consumer;

export function ReactRendererProvider(props: {
  value: { [key: string]: ComponentType<any> };
  children: ReactNode;
}) {
  return createElement(
    ReactRendererConsumer,
    null,
    // @ts-expect-error TS function overloads don't handle function children for consumers
    (parentComponentMap: { [key: string]: ComponentType<any> }) => {
      const mergedValues = { ...parentComponentMap, ...props.value };
      return createElement(
        ReactRendererContext.Provider,
        { value: mergedValues },
        props.children
      );
    }
  );
}

export type PropsOf<AnnotationClass> = AnnotationClass extends Annotation<
  infer Attributes
>
  ? {
      [P in keyof Attributes]: Attributes[P] extends Document
        ? React.ReactFragment
        : Attributes[P];
    } & { children?: ReactNode }
  : never;

function propsOf(
  attributes: JSON | undefined,
  subdocuments: Record<string, typeof Document>,
  id: string,
  transformer: (annotation: HIRNode, key: string) => unknown
): any {
  if (attributes == null) {
    return attributes;
  } else if (Array.isArray(attributes)) {
    return attributes.map((item, index) =>
      propsOf(item, {}, `${id}-${index}`, transformer)
    );
  } else if (typeof attributes === "object") {
    let props: JSON = {};
    for (let key in attributes) {
      if (key in subdocuments && attributes[key] != null) {
        // @ts-expect-error JSON doesn't allow for typeof Document
        props[key] = render({ document: attributes[key] as Document });
      } else {
        props[key] = propsOf(attributes[key], {}, `${id}-${key}`, transformer);
      }
    }
    return props;
  }
  return attributes;
}

function renderNode(props: {
  node: HIRNode;
  includeParseTokens: boolean;
  key: string;
}): ReactNode {
  let { node, includeParseTokens, key } = props;
  let annotation = node.annotation;
  if (is(annotation, TextAnnotation)) {
    return node.text;
  } else if (annotation.type === "slice") {
    return createElement(Fragment, {});
  }

  return createElement(ReactRendererConsumer, {
    key,
    children: (componentMap: { [key: string]: ComponentType<any> }) => {
      if (componentMap === EMPTY_COMPONENT_MAP) {
        throw new Error(
          "Component map is empty. Did you wrap your render call in ReactRendererProvider?"
        );
      }

      let AnnotationComponent =
        componentMap[annotation.type] ||
        componentMap[classify(annotation.type)] ||
        componentMap.Default;

      let childNodes = node.children({ includeParseTokens });
      let children = [];
      for (let i = 0, len = childNodes.length; i < len; i++) {
        children[i] = renderNode({
          node: childNodes[i],
          includeParseTokens,
          key: `${node.id}-${i}`,
        });
      }

      // Deprecated code, to be removed when subdocuments
      // are fully deprecated.
      if (AnnotationComponent) {
        let subdocuments = annotation.getAnnotationConstructor().subdocuments;
        return createElement(
          AnnotationComponent,
          {
            ...propsOf(
              annotation.attributes,
              subdocuments,
              annotation.id,
              (node: HIRNode, key: string) => {
                return renderNode({
                  node,
                  includeParseTokens,
                  key: `${key}-${node.id}`,
                });
              }
            ),
          },
          ...children
        );
      } else {
        return children;
      }
    },
  });
}

function render(document: Document): ReactElement;
function render(props: {
  document: Document;
  includeParseTokens: boolean;
}): ReactElement;
function render(
  propsOrDocument:
    | Document
    | { document: Document; includeParseTokens?: boolean }
): ReactElement {
  let props =
    propsOrDocument instanceof Document
      ? { document: propsOrDocument }
      : propsOrDocument;
  let hir = new HIR(props.document);
  let rootNode = hir.rootNode;
  return createElement(
    SliceContext.Provider,
    {
      value: {
        slices: hir.slices,
        includeParseTokens: props.includeParseTokens === true,
      },
    },
    createElement(
      Fragment,
      {},
      ...rootNode
        .children({ includeParseTokens: props.includeParseTokens === true })
        .map((node, index) =>
          renderNode({
            node,
            includeParseTokens: props.includeParseTokens === true,
            key: `${node.id}-${index}`,
          })
        )
    )
  );
}

/**
 * Renders a slice that was created via a `SliceAnnotation`.
 * If you know the rendered output will be identical for
 * every instance of the slice, wrap the component in
 * `React.memo` for better performance.
 *
 * @example <Slice value={props.caption} />
 * @param props The id of the slice to render
 * @returns A React fragment with the value of the slice
 */
export function Slice(props: { value?: string; fallback?: ReactNode }) {
  let { value, fallback } = props;
  let { slices, includeParseTokens } = useContext(SliceContext);
  let slice = useMemo(() => (value ? slices[value] : null), [value]);
  if (slice) {
    return render({ document: slice, includeParseTokens });
  } else {
    return createElement(Fragment, {}, fallback);
  }
}
Slice.displayName = "Slice";

export default {
  render,
};

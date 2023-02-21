import Document, {
  Annotation,
  AnnotationConstructor,
  serialize,
} from "@atjson/document";
import type { JSON } from "@atjson/document";
import {
  createTree,
  extractSlices,
  Block,
  InternalMark,
  ROOT,
} from "@atjson/util";
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
  slices: Record<
    string,
    { text: string; blocks: Block[]; marks: InternalMark[] }
  >;
  schema: AnnotationConstructor<any, any>[];
}>({ slices: {}, schema: [] });

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
  id: string
): any {
  if (attributes == null) {
    return attributes;
  } else if (Array.isArray(attributes)) {
    return attributes.map((item, index) => propsOf(item, {}, `${id}-${index}`));
  } else if (typeof attributes === "object") {
    let props: JSON = {};
    for (let key in attributes) {
      if (key in subdocuments && attributes[key] != null) {
        // @ts-expect-error JSON doesn't allow for typeof Document
        props[key] = render({ document: attributes[key] as Document });
      } else {
        props[key] = propsOf(attributes[key], {}, `${id}-${key}`);
      }
    }
    return props;
  }
  return attributes;
}

function renderNode(props: {
  id: string;
  tree: Record<string, Array<string | InternalMark | Block>>;
  schema: AnnotationConstructor<any, any>[];
}): ReactNode {
  let { id, tree, schema } = props;
  let children = tree[id] ?? [];

  return createElement(ReactRendererConsumer, {
    key: id,
    children: (componentMap: { [key: string]: ComponentType<any> }) => {
      if (componentMap === EMPTY_COMPONENT_MAP) {
        throw new Error(
          "Component map is empty. Did you wrap your render call in ReactRendererProvider?"
        );
      }

      return createElement(
        Fragment,
        {},
        children.map((child, index) => {
          if (typeof child == "string") {
            return createElement(Fragment, { key: index }, child);
          }

          let nodes = tree[child.id] ?? [];
          let children = nodes.every((node) => typeof node === "string")
            ? (tree[child.id] ?? []).join("")
            : renderNode({ tree, id: child.id, schema });

          let AnnotationComponent =
            componentMap[child.type] ||
            componentMap[classify(child.type)] ||
            componentMap.Default;
          let AnnotationClass = schema.find(
            (annotationClass) => annotationClass.type === child.type
          );
          let attributes = AnnotationComponent
            ? propsOf(
                child.attributes,
                AnnotationClass?.subdocuments ?? {},
                child.id
              )
            : {};

          // @ts-ignore undefined | false is ok here
          if (child.selfClosing) {
            return createElement(
              Fragment,
              { key: child.id },
              createElement(AnnotationComponent, attributes),
              children
            );
          }

          if (nodes.length > 0) {
            return createElement(
              AnnotationComponent,
              { key: child.id, ...attributes },
              children
            );
          } else {
            return createElement(AnnotationComponent, {
              key: child.id,
              ...attributes,
            });
          }
        })
      );
    },
  });
}

function render(document: Document): ReactElement;
function render(props: {
  document: Document;
  includeParseTokens: boolean;
}): ReactElement;
function render(
  propsOrDocument: Document | { document: Document }
): ReactElement {
  let props =
    propsOrDocument instanceof Document
      ? { document: propsOrDocument }
      : propsOrDocument;

  let json = serialize(props.document);

  let [doc, slices] = extractSlices({
    text: json.text,
    blocks: json.blocks ?? [],
    marks: json.marks ?? [],
  });
  let tree = createTree(doc);
  let schema = (props.document.constructor as typeof Document).schema;

  return createElement(
    SliceContext.Provider,
    {
      value: {
        slices,
        schema,
      },
    },
    createElement(
      Fragment,
      {},
      renderNode({
        id: ROOT,
        tree,
        schema,
      })
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
export function Slice(props: {
  value?: string;
  fallback?: ReactNode;
}): ReactElement {
  let { value, fallback } = props;
  let slices = useContext(SliceContext);
  let tree = useMemo(
    () => (value ? createTree(slices.slices[value]) : null),
    [value]
  );

  if (tree) {
    return createElement(
      Fragment,
      {},
      renderNode({ tree, id: ROOT, schema: slices.schema })
    );
  } else {
    return createElement(Fragment, {}, fallback);
  }
}
Slice.displayName = "Slice";

export default {
  render,
};

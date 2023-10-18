import { createElement, Fragment, useContext, useMemo } from "react";
import type { ReactElement } from "react";
import type { Block, InternalMark } from "@atjson/util";
import { ComponentContext, DEFAULT_CONTEXT } from "../contexts";

/**
 * Renders a subtree of a document with a root
 * id of `id`
 *
 * @example <Node value={props.map} id={ROOT} />
 * @param props.map A map of node values by id
 * @param props.id The id of the node to render
 * @returns A React fragment with the subtree of the node with the id provided
 */
export function Node(props: {
  value: Block | InternalMark;
  map: Map<string, Array<string | Block | InternalMark>>;
}): ReactElement {
  let context = useContext(ComponentContext);
  if (context === DEFAULT_CONTEXT) {
    throw new Error(
      "Component map is empty. Did you wrap your render call in ComponentProvider?"
    );
  }

  let Component = useMemo(() => {
    let key = context.keyOf(props.value);
    return (
      ("start" in props.value ? context.marks[key] : context.blocks[key]) ??
      Fragment
    );
  }, [props.map, props.value]);
  let children = useMemo(
    () => props.map.get(props.value.id) ?? [],
    [props.map, props.value]
  );
  let attributes = Component ? props.value.attributes : {};

  // @ts-ignore undefined | false is ok here
  if (props.value.selfClosing) {
    return createElement(
      Fragment,
      {},
      createElement(Component, attributes),
      ...children.map((child) => {
        if (typeof child === "string") {
          return child;
        }
        return createElement(Node, {
          value: child,
          key: child.id,
          map: props.map,
        });
      })
    );
  }

  // If every child is text, we will return a single text fragment
  // with the text joined together.
  if (children.every((child) => typeof child === "string")) {
    return createElement(Component, attributes, children.join(""));
  }

  if (children.length > 0) {
    return createElement(
      Component,
      { key: props.value.id, ...attributes },
      ...children.map((child) => {
        if (typeof child === "string") {
          return child;
        }
        return createElement(Node, {
          value: child,
          key: child.id,
          map: props.map,
        });
      })
    );
  } else {
    return createElement(Component, { attributes });
  }
}
Node.displayName = "Node";

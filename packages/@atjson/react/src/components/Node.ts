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
  map: Record<string, Array<string | Block | InternalMark>>;
  id: string;
}): ReactElement {
  let children = useMemo(
    () => props.map[props.id] ?? [],
    [props.map, props.id]
  );
  let context = useContext(ComponentContext);
  if (context === DEFAULT_CONTEXT) {
    throw new Error(
      "Component map is empty. Did you wrap your render call in ComponentProvider?"
    );
  }
  return createElement(
    Fragment,
    {},
    children.map((child, index) => {
      if (typeof child == "string") {
        return createElement(Fragment, { key: index }, child);
      }

      let key = context.keyOf(child);
      let Component =
        ("start" in child ? context.marks[key] : context.blocks[key]) ??
        Fragment;
      let attributes = Component ? child.attributes : {};

      // Reduce number of components by checking if every child
      // is text, and
      let nodes = props.map[child.id] ?? [];
      let children = nodes.every((node) => typeof node === "string")
        ? (props.map[child.id] ?? []).join("")
        : createElement(Node, { map: props.map, id: child.id });

      // @ts-ignore undefined | false is ok here
      if (child.selfClosing) {
        return createElement(
          Fragment,
          { key: child.id },
          createElement(Component, attributes),
          children
        );
      }
      if (nodes.length > 0) {
        return createElement(
          Component,
          { key: child.id, ...attributes },
          children
        );
      } else {
        return createElement(Component, { key: child.id, ...attributes });
      }
    })
  );
}
Node.displayName = "Node";

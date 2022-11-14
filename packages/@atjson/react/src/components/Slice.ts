import type { ReactElement, ReactNode } from "react";
import { createElement, Fragment, useContext, useMemo } from "react";
import { createTree } from "../utils";
import { Node } from "./Node";
import { SliceContext } from "../contexts";
import { ROOT } from "../const";

/**
 * Renders a slice that was created via a `Slice` mark.
 * If you know the rendered output will be identical for
 * every instance of the slice, wrap the component in
 * `React.memo` for better performance.
 *
 * @example <Slice value={props.caption} />
 * @param props.value The id of the slice to render
 * @param props.fallback A fallback React component to render
 * @returns A React fragment with the value of the slice
 */
export function Slice(props: {
  value?: string;
  fallback?: ReactNode;
}): ReactElement {
  let { value, fallback } = props;
  let slices = useContext(SliceContext);
  let tree = useMemo(() => (value ? createTree(slices[value]) : null), [value]);

  if (tree) {
    return createElement(Node, { map: tree, id: ROOT });
  } else {
    return createElement(Fragment, {}, fallback);
  }
}
Slice.displayName = "Slice";

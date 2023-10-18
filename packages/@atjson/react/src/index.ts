import type { Block, InternalMark, Mark } from "@atjson/util";
import { ROOT, createTree, extractSlices } from "@atjson/util";
import { ComponentContext, ComponentProvider, SliceContext } from "./contexts";
import { Node, Slice } from "./components";
import { useMemo, createElement, Fragment } from "react";

export { ComponentContext, ComponentProvider, Slice };

export default function Text(props: {
  value: {
    text: string;
    marks?: Mark[];
    blocks?: Block[];
  };
}) {
  let [tree, slices] = useMemo(() => {
    let [doc, slices] = extractSlices({
      text: props.value.text,
      blocks: props.value.blocks ?? [],
      marks: props.value.marks ?? [],
    });
    return [createTree(doc), slices] as const;
  }, [props.value]);

  let children = useMemo(() => {
    if (ROOT in tree) {
      return tree[ROOT] as Array<InternalMark | Block | string>;
    }
    return [""];
  }, [tree]);

  return createElement(
    SliceContext.Provider,
    { value: slices },
    createElement(
      Fragment,
      {},
      children.map((child) => {
        if (typeof child === "string") {
          return child;
        }
        return createElement(Node, { value: child, map: tree });
      })
    )
  );
}
Text.displayName = "Text";

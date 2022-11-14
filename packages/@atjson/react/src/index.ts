import type { Block, Mark } from "./types";
import { ComponentContext, ComponentProvider, SliceContext } from "./contexts";
import { Node, Slice } from "./components";
import { ROOT } from "./const";
import { useMemo, createElement } from "react";
import { createTree, extractSlices } from "./utils";

export {
  ComponentContext,
  ComponentProvider,
  Slice,
  createTree,
  extractSlices,
};

export default function Text(props: {
  value: {
    text: string;
    marks: Mark[];
    blocks: Block[];
  };
}) {
  let [tree, slices] = useMemo(() => {
    let [doc, slices] = extractSlices(props.value);
    return [createTree(doc), slices] as const;
  }, [props.value]);

  return createElement(
    SliceContext.Provider,
    { value: slices },
    createElement(Node, { map: tree, id: ROOT })
  );
}
Text.displayName = "Text";

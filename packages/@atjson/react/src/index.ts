import type { Block, Mark } from "@atjson/util";
import { ROOT, createTree, extractSlices } from "@atjson/util";
import { ComponentContext, ComponentProvider, SliceContext } from "./contexts";
import { Node, Slice } from "./components";
import { useMemo, createElement } from "react";

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

  return createElement(
    SliceContext.Provider,
    { value: slices },
    createElement(Node, { map: tree, id: ROOT })
  );
}
Text.displayName = "Text";

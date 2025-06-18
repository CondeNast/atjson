import type { Block, Mark } from "@atjson/util";
import { ROOT, createTree, extractSlices } from "@atjson/util";
import { ComponentContext, ComponentProvider, SliceContext } from "./contexts";
import { Node, Slice } from "./components";
import { useMemo, createElement, Fragment } from "react";
import { DataSetContext, DataSetAttrs } from "./contexts/DataSet";
import { useDataSet } from "./hooks/useDataSet";

export { ComponentContext, ComponentProvider, Slice, useDataSet };

export default function Text(props: {
  value: {
    text: string;
    marks?: Mark[];
    blocks?: Block[];
  };
}) {
  let [tree, slices, dataSets] = useMemo(() => {
    let [doc, slices] = extractSlices({
      text: props.value.text,
      blocks: props.value.blocks ?? [],
      marks: props.value.marks ?? [],
    });

    let dataSets = new Map(
      doc.blocks
        .filter((block) => block.type === "data-set")
        .map((dataSet) => [dataSet.id, dataSet.attributes as DataSetAttrs]),
    );
    return [createTree(doc), slices, dataSets] as const;
  }, [props.value]);

  let children = useMemo(() => {
    if (tree.has(ROOT)) {
      return tree.get(ROOT) ?? [""];
    }
    return [""];
  }, [tree]);

  return createElement(
    SliceContext.Provider,
    { value: slices },
    createElement(
      DataSetContext.Provider,
      { value: dataSets },
      createElement(
        Fragment,
        {},
        children.map((child) => {
          if (typeof child === "string") {
            return child;
          }
          return createElement(Node, {
            value: child,
            map: tree,
            key: child.id,
          });
        }),
      ),
    ),
  );
}
Text.displayName = "Text";

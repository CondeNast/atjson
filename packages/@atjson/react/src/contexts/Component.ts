import type { Block, InternalMark } from "@atjson/util";
import { createContext, createElement, ComponentType, ReactNode } from "react";

export const DEFAULT_CONTEXT = {
  keyOf: (blockOrMark: Block | InternalMark) => blockOrMark.type,
  blocks: {},
  marks: {},
};

export const ComponentContext = createContext<{
  keyOf: (blockOrMark: Block | InternalMark) => string;
  blocks: Record<string, ComponentType<any>>;
  marks: Record<string, ComponentType<any>>;
}>(DEFAULT_CONTEXT);

export function ComponentProvider(props: {
  value: {
    keyOf?: (blockOrMark: Block | InternalMark) => string;
    blocks?: Record<string, ComponentType<any>>;
    marks?: Record<string, ComponentType<any>>;
  };
  children: ReactNode;
}) {
  return createElement(ComponentContext.Consumer, {
    children(parent) {
      return createElement(
        ComponentContext.Provider,
        {
          value: {
            keyOf: props.value.keyOf ?? parent.keyOf,
            blocks: props.value.blocks
              ? {
                  ...parent.blocks,
                  ...props.value.blocks,
                }
              : parent.blocks,
            marks: props.value.marks
              ? {
                  ...parent.marks,
                  ...props.value.marks,
                }
              : parent.marks,
          },
        },
        props.children
      );
    },
  });
}
ComponentProvider.displayName = "ComponentProvider";

import { createContext } from "react";
import type { Block, InternalMark } from "@atjson/util";

export const SliceContext = createContext(
  new Map<string, { text: string; blocks: Block[]; marks: InternalMark[] }>()
);

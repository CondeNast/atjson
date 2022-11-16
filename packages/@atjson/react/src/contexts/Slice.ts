import { createContext } from "react";
import type { Block, InternalMark } from "@atjson/util";

export const SliceContext = createContext<
  Record<string, { text: string; blocks: Block[]; marks: InternalMark[] }>
>({});

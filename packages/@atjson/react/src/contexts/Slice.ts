import { createContext } from "react";
import type { Block, InternalMark } from "../types";

export const SliceContext = createContext<
  Record<string, { text: string; blocks: Block[]; marks: InternalMark[] }>
>({});

import { createContext } from "react";

export type DataSetAttrs = {
  name?: string;
  schema: Record<string, string>;
  records: Array<Record<string, { slice: string; jsonValue: any }>>;
};

export const DataSetContext = createContext(new Map<string, DataSetAttrs>());

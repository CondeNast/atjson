import { MarkSchema, AttributesOf } from "./schema";

export type Mark<T extends MarkSchema> = {
  id: string;
  type: T["type"];
  range: string;
  attributes: AttributesOf<T>;
};

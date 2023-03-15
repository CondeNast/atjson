import { MarkSchema, AttributesOf } from "./schema";

export type Mark<T extends MarkSchema> = {
  id: string;
  type: string;
  range: string;
  attributes: AttributesOf<T>;
};

import { BlockSchema, AttributesOf } from "./schema";

export type Block<T extends BlockSchema> = {
  id: string;
  type: string;
  parents: string[];
  selfClosing: boolean;
  attributes: AttributesOf<T>;
};

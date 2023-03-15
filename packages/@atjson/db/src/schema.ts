type Attribute = Readonly<{
  type:
    | "string"
    | "string[]"
    | "boolean"
    | "boolean[]"
    | "date"
    | "date[]"
    | "int"
    | "int[]"
    | "float"
    | "float[]"
    | "unknown"
    | { $oneOf: ReadonlyArray<string> }
    | Readonly<{ [key: string]: Attribute }>;
  required?: boolean;
  comment: string;
}>;

export type AttributesOf<T extends MarkSchema | BlockSchema> = {
  [P in keyof T["attributes"]]: T["attributes"][P]["type"] extends "string"
    ? string
    : T["attributes"][P]["type"] extends "string[]"
    ? string[]
    : T["attributes"][P]["type"] extends "int"
    ? number
    : T["attributes"][P]["type"] extends "int[]"
    ? number[]
    : T["attributes"][P]["type"] extends "float"
    ? number
    : T["attributes"][P]["type"] extends "float[]"
    ? number[]
    : T["attributes"][P]["type"] extends "boolean"
    ? boolean
    : T["attributes"][P]["type"] extends "boolean[]"
    ? boolean[]
    : T["attributes"][P]["type"] extends "date"
    ? Date
    : T["attributes"][P]["type"] extends "date[]"
    ? Date[]
    : T["attributes"][P]["type"] extends { $oneOf: unknown }
    ? T["attributes"][P]["type"]["$oneOf"]
    : T["attributes"][P]["type"] extends "unknown"
    ? unknown
    : never;
};

export type MarkSchema = Readonly<{
  type: string;
  comment: string;
  attributes: Readonly<{
    [key: string]: Attribute;
  }>;
}>;

export type BlockSchema = Readonly<{
  type: string;
  comment: string;
  defaultSelfClosing?: boolean;
  attributes: Readonly<{
    [key: string]: Attribute;
  }>;
}>;

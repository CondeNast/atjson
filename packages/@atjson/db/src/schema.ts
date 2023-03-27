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

type Type<T extends Attribute["type"]> = T extends "string"
  ? string
  : T extends "string[]"
  ? string[]
  : T extends "int"
  ? number
  : T extends "int[]"
  ? number[]
  : T extends "float"
  ? number
  : T extends "float[]"
  ? number[]
  : T extends "boolean"
  ? boolean
  : T extends "boolean[]"
  ? boolean[]
  : T extends "date"
  ? Date
  : T extends "date[]"
  ? Date[]
  : T extends { $oneOf: Array<infer OneOf> }
  ? OneOf
  : T extends "unknown"
  ? unknown
  : T extends Readonly<{ [key: string]: Attribute }>
  ? Attributes<T>
  : never;

type Attributes<
  T extends Readonly<{
    [key: string]: Attribute;
  }>
> = {
  -readonly [P in keyof T]: T[P]["required"] extends true
    ? Type<T[P]["type"]>
    : Type<T[P]["type"]> | null | undefined;
};

export type AttributesOf<T extends BlockSchema | MarkSchema> = Attributes<
  T["attributes"]
>;

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

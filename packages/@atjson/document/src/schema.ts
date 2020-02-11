import { Annotation, AnnotationJSON } from "./internals";

export interface SchemaDefinition {
  annotations: {
    [key: string]: {
      vendorPrefix: string;
      type: string;
      new (attrs: {
        id?: string;
        start: number;
        end: number;
        attributes?: any;
      }): Annotation<any>;
      hydrate(json: AnnotationJSON): Annotation<any>;
    };
  };
}

export type SchemaNames<
  Schema extends SchemaDefinition
> = keyof Schema["annotations"];
export type SchemaClasses<
  Schema extends SchemaDefinition
> = Schema["annotations"][SchemaNames<Schema>];

export type AnnotationNamed<
  Schema extends SchemaDefinition,
  Name extends string
> = Name extends SchemaNames<Schema> ? Schema["annotations"][Name] : never;

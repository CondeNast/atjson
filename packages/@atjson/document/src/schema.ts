import Annotation, { SerializedAnnotation } from "./annotation";
import { ParseAnnotation, UnknownAnnotation } from "./annotations";

export interface SchemaDefinition {
  type: string;
  version: string;
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
      hydrate(json: SerializedAnnotation): Annotation<any>;
    };
  };
}

export type SchemaNames<Schema extends any> = Schema extends SchemaDefinition
  ? keyof Schema["annotations"]
  : never;

export type SchemaClasses<Schema extends any> = Schema extends SchemaDefinition
  ? Schema["annotations"][SchemaNames<Schema>]
  : never;

export type ValidAnnotations<
  Schema extends any
> = Schema extends SchemaDefinition
  ? InstanceType<SchemaClasses<Schema>> | ParseAnnotation | UnknownAnnotation
  : never;

export type AnnotationNamed<
  Schema extends SchemaDefinition,
  Name extends string
> = Name extends SchemaNames<Schema> ? Schema["annotations"][Name] : never;

export function isInSchema<Schema extends SchemaDefinition>(
  annotation: Annotation<any>,
  schema: Schema
): annotation is InstanceType<SchemaClasses<Schema>> {
  return Object.keys(schema.annotations).some(className => {
    return annotation instanceof schema.annotations[className];
  });
}

export function findAnnotationFor<Schema extends SchemaDefinition>(
  annotation: Annotation<any> | SerializedAnnotation,
  schema: Schema
): SchemaClasses<Schema> | typeof UnknownAnnotation | typeof ParseAnnotation {
  let type =
    annotation instanceof UnknownAnnotation
      ? annotation.attributes.type
      : annotation.type;

  if (type === `-${ParseAnnotation.vendorPrefix}-${ParseAnnotation.type}`) {
    return ParseAnnotation;
  }

  let name = Object.keys(schema.annotations).find(className => {
    let Class = schema.annotations[className];
    return type === `-${Class.vendorPrefix}-${Class.type}`;
  });

  if (name) {
    return schema.annotations[name] as SchemaClasses<Schema>;
  } else {
    return UnknownAnnotation;
  }
}

export function isValidName<Schema extends SchemaDefinition>(
  schema: Schema,
  name: any
): name is SchemaNames<Schema> {
  return typeof name === "string" && schema.annotations[name] != null;
}

export function isValidType<Schema extends SchemaDefinition>(
  schema: Schema,
  type: any
): type is
  | SchemaClasses<Schema>
  | typeof UnknownAnnotation
  | typeof ParseAnnotation {
  return (
    type === ParseAnnotation ||
    type === UnknownAnnotation ||
    Object.keys(schema.annotations).some(className => {
      return schema.annotations[className] === type;
    })
  );
}

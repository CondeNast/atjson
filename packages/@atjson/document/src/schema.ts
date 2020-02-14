import {
  Annotation,
  AnnotationJSON,
  ParseAnnotation,
  UnknownAnnotation
} from "./internals";

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

export type ValidAnnotations<Schema extends SchemaDefinition> =
  | InstanceType<SchemaClasses<Schema>>
  | ParseAnnotation
  | UnknownAnnotation;

export type AnnotationNamed<
  Schema extends SchemaDefinition,
  Name extends SchemaNames<Schema>
> = Schema["annotations"][Name];

export function isInSchema<Schema extends SchemaDefinition>(
  annotation: Annotation<any>,
  schema: Schema
): annotation is InstanceType<SchemaClasses<Schema>> {
  return Object.keys(schema.annotations).some(className => {
    return annotation instanceof schema.annotations[className];
  });
}

function getQualifiedType(annotation: Annotation<any> | AnnotationJSON) {
  let type = annotation.type;
  if ("vendorPrefix" in annotation) {
    type = `-${annotation.vendorPrefix}-${annotation.type}`;
  }

  if (type === `-${UnknownAnnotation.vendorPrefix}-${UnknownAnnotation.type}`) {
    return annotation.attributes.type;
  } else {
    return type;
  }
}

export function findAnnotationFor<Schema extends SchemaDefinition>(
  annotation: Annotation<any> | AnnotationJSON,
  schema: Schema
): SchemaClasses<Schema> | typeof UnknownAnnotation | typeof ParseAnnotation {
  let type = getQualifiedType(annotation);
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

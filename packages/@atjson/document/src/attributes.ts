import Document, { AnnotationJSON } from "./index";
import JSON from "./json";

export function hydrate(
  subDocuments: { [key: string]: typeof Document },
  attribute: JSON
): NonNullable<any> {
  let attributes: NonNullable<any> = { ...(attribute as any) };
  for (let key in subDocuments) {
    if (attributes[key] != null) {
      let serializedDocument = (attributes[key] as any) as {
        content: string;
        annotations: AnnotationJSON[];
      };
      attributes[key] = new subDocuments[key](serializedDocument);
    }
  }
  return attributes;
}

export function toJSON(
  subDocuments: { [key: string]: typeof Document },
  attribute: NonNullable<any>
): any {
  let attributes: any = { ...(attribute as any) };
  for (let key in subDocuments) {
    if (attribute[key] instanceof Document) {
      attributes[key] = attribute[key].toJSON();
    }
  }
  return attributes;
}

export function clone(attribute: any): NonNullable<any> {
  if (attribute == null) {
    return null;
  } else if (Array.isArray(attribute)) {
    let copy = [];
    for (let i = 0, len = attribute.length; i < len; i++) {
      copy[i] = clone(attribute[i]);
    }
    return copy;
  } else if (attribute instanceof Document) {
    return attribute.clone();
  } else if (typeof attribute === "object") {
    let copy: NonNullable<any> = {};
    for (let key in attribute) {
      if (attribute[key] !== undefined) {
        copy[key] = clone(attribute[key]);
      }
    }
    return copy;
  } else {
    return attribute;
  }
}

import Document, { AnnotationJSON } from "./index";
import JSON, { JSONObject } from "./json";

export function unprefix(
  subdocuments: { [key: string]: typeof Document },
  attribute: JSON,
  path: Array<string | number> = []
): NonNullable<any> {
  if (Array.isArray(attribute)) {
    return attribute.map(function unprefixAttr(attr, index) {
      let result = unprefix(
        subdocuments,
        attr,
        path.concat(index)
      );
      return result;
    });
  } else if (subdocuments[path.join(".")]) {
    let serializedDocument = (attribute as any) as {
      content: string;
      annotations: AnnotationJSON[];
    };
    return new subdocuments[path.join(".")](serializedDocument);
  } else if (attribute == null) {
    return null;
  } else if (typeof attribute === "object") {
    let attrs: NonNullable<any> = {};
    for (let key in attribute) {
      let value = attribute[key];
      if (value !== undefined) {
        attrs[key] = unprefix(
          subdocuments,
          value,
          path.concat(key)
        );
      } else {
        attrs[key] = value;
      }
    }

    return attrs;
  } else {
    return attribute;
  }
}

export function toJSON(attribute: NonNullable<any>): any {
  if (Array.isArray(attribute)) {
    return attribute.map(function attributeToJSON(attr) {
      let result = toJSON(attr);
      return result;
    });
  } else if (attribute instanceof Document) {
    return attribute.toJSON();
  } else if (attribute == null) {
    return null;
  } else if (typeof attribute === "object") {
    let copy: JSONObject = {};
    for (let key in attribute) {
      let value = attribute[key];
      if (value !== undefined) {
        copy[key] = toJSON(value);
      }
    }

    return copy;
  } else {
    return attribute;
  }
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
